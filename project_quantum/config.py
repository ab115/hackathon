import os
from dotenv import load_dotenv

# STAGE 2 BUG: Missing dotenv load
# load_dotenv()

# STAGE 2 BUG: Fallback is hardcoded to a non-existent postgres DB
DATABASE_URL = os.getenv("SQLITE_URL", "postgresql://user:pass@localhost:5432/quantum")

SECRET_KEY = "quantum_secret_master_key"
