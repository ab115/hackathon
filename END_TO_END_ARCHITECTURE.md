# HackFusion End-to-End Architecture & Resource Workflows

This document outlines the detailed end-to-end architecture, resource-level interactions, and core workflows of the HackFusion platform.

## 1. High-Level System Architecture

The system is broken down into modular layers ensuring separation of concerns, scalability, and ease of maintenance.

```mermaid
graph TD
    subgraph Client_Layer
        SP[Student Portal React]
        AD[Admin Dashboard React]
        MP[Mentor Portal React]
    end

    subgraph API_Gateway_Layer
        AX[Axios Client & Interceptors]
        AuthAPI[Auth API Routes]
        HackAPI[Hackathon API Routes]
        PayAPI[Payment API Routes]
        JiraAPI[Jirathon API Routes]
    end

    subgraph Core_Backend_Layer
        FastAPI[FastAPI Main App]
        AuthMgr[Auth Manager]
        PayProc[Payment Processor]
        TeamMgr[Team Manager]
    end

    subgraph Microservices
        JiraNode[Jirathon Node.js Engine]
    end

    subgraph Data_Layer
        PG[(PostgreSQL - Primary DB)]
        SQL[(SQLite - Jirathon DB)]
        Redis[(Redis Cache)]
    end

    %% Routing Flow
    SP --> AX
    AD --> AX
    MP --> AX

    AX --> AuthAPI
    AX --> HackAPI
    AX --> PayAPI
    AX --> JiraAPI

    AuthAPI --> FastAPI
    HackAPI --> FastAPI
    PayAPI --> FastAPI
    
    JiraAPI --> JiraNode

    FastAPI --> AuthMgr
    FastAPI --> PayProc
    FastAPI --> TeamMgr

    %% Cache Flow
    FastAPI -.->|Read/Write Cache| Redis
    AuthMgr -.-> Redis
    TeamMgr -.-> Redis

    %% DB Flow
    AuthMgr --> PG
    PayProc --> PG
    TeamMgr --> PG

    JiraNode --> SQL
```

---

## 2. Resource-Level Workflows

The following diagrams illustrate how specific resources interact across the stack during critical user journeys.

### 2.1 Registration & Payment Workflow

This workflow handles a student registering for a paid hackathon, generating a payment hash, communicating with PayU, and finalizing the registration record.

```mermaid
sequenceDiagram
    participant UI as Student Portal UI
    participant API as React Axios Client
    participant PayAPI as FastAPI Payment Router
    participant DB as PostgreSQL DB
    participant Gateway as PayU Gateway

    UI->>API: Click "Register & Pay"
    API->>PayAPI: POST /payments/initiate {hackathon_id}
    PayAPI->>DB: Create Pending Registration Record
    PayAPI->>PayAPI: Calculate GST & Generate Secure Hash
    PayAPI-->>API: Return transaction_id, hash, payload
    API-->>UI: Redirect to PayU URL with payload
    
    UI->>Gateway: Submit Payment Form
    Gateway-->>UI: Redirect back to /payment/callback
    
    UI->>API: Send payment success/failure params
    API->>PayAPI: POST /payments/verify {txnid, status}
    PayAPI->>DB: Update Registration Status (Completed/Failed)
    PayAPI-->>API: 200 OK Status
    API-->>UI: Show "Registration Successful" Screen
```

### 2.2 Jirathon Coding Challenge Workflow

This workflow handles the decentralized Microservice architecture for the anti-LLM coding challenges, utilizing an isolated Node.js environment to validate flags.

```mermaid
sequenceDiagram
    participant UI as Jirathon Widget (Frontend)
    participant NodeAPI as Jirathon Node.js Microservice
    participant LocalDB as Jirathon SQLite DB
    participant CoreDB as PostgreSQL Main DB

    UI->>NodeAPI: POST /api/v1/submit {team_id, challenge_id, key}
    NodeAPI->>NodeAPI: Validate Key Format
    
    alt Key is Invalid
        NodeAPI-->>UI: 400 Error: "Invalid Key"
    else Key is Valid
        NodeAPI->>LocalDB: Fetch TeamProgress Record
        NodeAPI->>NodeAPI: Check if stage already cleared
        NodeAPI->>LocalDB: Update score & stage
        NodeAPI-->>UI: 200 OK: "Stage Cleared!"
        
        %% Async sync to main leaderboard
        NodeAPI-)CoreDB: Event/Webhook: Sync Score to Main Leaderboard
    end
```

### 2.3 Mentorship Booking Workflow

The mentorship ecosystem relies on checking availability constraints and updating the calendar without double-booking.

```mermaid
sequenceDiagram
    participant UI as Student Portal UI
    participant API as Mentor API Router
    participant Auth as Auth Manager
    participant DB as PostgreSQL DB

    UI->>API: GET /mentors/available
    API->>DB: Query Mentors & Active Time Slots
    DB-->>API: Return Mentor List
    API-->>UI: Render Mentor Cards & Slots
    
    UI->>API: POST /mentorship/book {mentor_id, slot_time}
    API->>Auth: Validate Student Token
    Auth-->>API: Token Valid
    
    API->>DB: Check if Slot is currently 'Booked'
    alt Slot Already Booked
        DB-->>API: Conflict Error
        API-->>UI: 409 Conflict: "Slot taken"
    else Slot Available
        API->>DB: Insert Booking Record, Update Slot Status
        DB-->>API: Booking Confirmed
        API-->>UI: 200 OK: "Session Booked"
    end
```

### 2.4 Cache-Aside & Stampede Protection Workflow

To ensure performance during high-traffic events (e.g., Hackathon launches), the platform heavily uses an async Redis cache. It implements a probabilistic early-expiry model to prevent cache stampedes.

```mermaid
sequenceDiagram
    participant API as FastAPI Router
    participant Cache as Redis Cache (get_or_set)
    participant DB as PostgreSQL DB
    
    API->>Cache: GET Resource (e.g. /hackathons)
    
    alt Cache Hit (Valid TTL)
        Cache-->>API: Return Cached Data instantly
    else Cache Miss (or XFetch Early Expiry triggered)
        Cache-->>API: Null (Proceed to load)
        API->>DB: Execute Heavy Query
        DB-->>API: Return DB Results
        API->>Cache: SET Resource with new TTL
    end
    
    API-->>Client: Return JSON Response
    
    %% Invalidation trigger
    Note over API,Cache: On Admin Update (POST/PATCH), invalidate_pattern() clears stale cache.
```

---

## 3. Data Entities & Resource Mapping

### Primary Domain Models (PostgreSQL)

*   **Users**: Unified table for `Admin`, `Student`, and `Mentor` roles. Differentiated by `role` enum.
*   **Hackathons**: Contains configuration, dates, pricing, and visibility toggles.
*   **Teams**: Relates `Users` (members) to a specific `Hackathon`.
*   **Registrations**: Tracks payment intent, `transaction_id`, status, and final amount paid.
*   **MentorshipSessions**: Maps a `Student` to a `Mentor` at a specific timestamp.

### Microservice Domain Models (SQLite - Jirathon)

*   **TeamProgress**: Decoupled from the main database to allow high-throughput I/O during active CTF/Challenge phases without degrading core API performance. Tracks `stage_id` and `current_score`.
