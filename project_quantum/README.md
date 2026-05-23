# Project Quantum: Cohesive Full-Stack Debugging Challenge

Welcome to **Project Quantum**. This isn't just a collection of disconnected scripts—it is a fully cohesive, full-stack application consisting of a Python FastAPI backend, a SQLite database, and a Vanilla JS/HTML frontend. 

Unfortunately, the previous lead developer "accidentally" sabotaged the entire project before leaving the company. It's completely broken from the database layer all the way up to the frontend UI.

Your mission is to restore the application by fixing the bugs layer by layer. The app itself will generate your Jirathon stage keys once it is running properly!

## Requirements
- Python 3.10+
- `pip install -r requirements.txt`

## CRITICAL: Team Configuration
Before starting, you **MUST** copy `.env.example` to `.env` and set your `TEAM_NAME` to your exact team name as registered on the Hackathon portal.
Example: `TEAM_NAME=alpha_squad`
If you do not set this, your generated keys will be rejected by the remote server!

## The 10 Stages of Quantum

### Stage 1: The Database Schema
The app won't even boot right now. There's a fatal circular dependency or misconfigured relationship in `models.py`. 
**Goal:** Fix the ORM relationships so the app can boot. Hit `/api/health` to get your Stage 1 key.

### Stage 2: Configuration
The database connection string in `config.py` is hardcoded to a non-existent Postgres database. 
**Goal:** Fix it so it properly loads the `SQLITE_URL` from the `.env` file using `python-dotenv`.
**Hint:** Look for the `/api/init_db` endpoint to initialize the database and grab your Stage 2 key!

### Stage 3 & 4: Authentication & JWTs
The authentication logic is broken. Password hashing compares plaintext incorrectly, and the JWT token is missing the critical `sub` and `role` claims.
**Goal:** Fix `auth.py`. Successfully logging in and generating a valid JWT token will yield the keys for Stage 3 and 4 in the login response.

### Stage 5: Middleware Authorization
Protected routes are inaccessible. The middleware expects a `Token` prefix instead of the standard `Bearer`, and the expiration checks are bypassed.
**Goal:** Fix `middleware.py`. Once fixed, use your JWT to hit `/api/protected` to grab the Stage 5 key.

### Stage 6 & 7: The Frontend
The `static/app.js` is a mess. The fetch wrapper doesn't attach the `Authorization` header, and the closure inside the user list rendering loop causes everything to say `undefined`.
**Goal:** Fix the JS. The dashboard will automatically fetch data and log the Stage 6 and 7 keys to the console.

### Stage 8: Business Logic Loop
The `/api/metrics` endpoint has a severe bug that causes a ZeroDivisionError if there's only 1 user.
**Goal:** Fix the boundary condition logic in `main.py` so the endpoint succeeds and returns your Stage 8 key.

### Stage 9: Security Vulnerabilities
The `/api/users/search` endpoint has a broken string concatenation that was meant to be vulnerable to SQL injection, but instead, it's just syntactically broken.
**Goal:** Refactor it to use parameterized SQL queries safely. Running a successful query will yield the Stage 9 key.

### Stage 10: Cryptography
The "Vault" endpoint (`/api/vault`) is trying to decrypt a base64 payload using AES CBC mode, but the padding isn't being unpadded correctly using the PKCS7 standard.
**Goal:** Fix the python `cryptography` padding logic in the vault endpoint. When successfully decrypted, it will reveal your final Stage 10 key!

---

Good luck. The fate of E-Corp rests in your debugging skills.
