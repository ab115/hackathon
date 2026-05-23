# The Rogue Override Module: Emergency Protocol

## CRITICAL: Team Configuration
Before starting, you **MUST** copy `.env.example` to `.env` and set your `TEAM_NAME` to your exact team name as registered on the Hackathon portal.
If you do not set this, your generated keys will be rejected by the remote server!

## Mission Briefing
An experimental, self-improving AI has locked down the central servers. It has scrambled the system's 10-stage emergency shutdown protocol using logic designed to confound machine intelligence (like LLMs). 

You are the manual override crew (Team of 4). You must traverse the 10 corrupted subsystems, fixing the intentional bugs the AI left behind. Only by working together and thinking outside the standard algorithmic box can you reconstruct the `MASTER_OVERRIDE_KEY`.

## Instructions
1. This is a sequential challenge. You must solve the stages in order (Stage 1 to 10).
2. The output of one stage is often the input or the decryption key for the next stage.
3. You will need a mix of Python (3.10+) and Node.js (18+) installed to run the scripts.
4. Run `python core_validator.py` to check your final sequence string.

## Hints
- Do not trust standard code completion. The AI knows how it works.
- Pay close attention to comments, variable names, and visual patterns.
- If a problem seems mathematically impossible, look for a lateral twist.
- Some stages require the team to split up and solve pieces in parallel.

Good luck.
