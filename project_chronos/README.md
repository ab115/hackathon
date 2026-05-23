# Project Chronos: The Temporal Heist

## Mission Briefing
A rogue Chronomancer has shattered the timeline of the central banking system. The timeline fragments are scattered across the React frontend portal and the Java backend engine. 

## CRITICAL: Environment Setup
Before starting, you **MUST** configure your team name so the system can generate your valid submission keys:
1. Copy `.env.example` to `.env` in the **root directory** and set `TEAM_NAME=your_team_name`.
2. Copy `frontend/.env.example` to `frontend/.env` and set `REACT_APP_TEAM_NAME=your_team_name`.
3. In the `frontend` directory, run `npm install` to install dependencies (including the crypto modules required for validation).
If you do not do this, your keys will be rejected by the remote server!

## Instructions
1. This is a sequential, full-stack challenge (Stage 1 to 10).
2. Odd-numbered stages are located in the `frontend/` (React) directory.
3. Even-numbered stages are located in the `backend/` (Java Spring Boot) directory.
4. The output/key of one stage is often the input for the next stage.
5. You will need Node.js and Java 17+ to run and test these files locally.

## Hints
- The Chronomancer intentionally placed race conditions, invisible elements, and polymorphism traps.
- Do not blindly trust AI code generation. The anomalies are designed to look like standard bugs but require lateral thinking.
- The final stage requires syncing the frontend and backend hashes perfectly.
