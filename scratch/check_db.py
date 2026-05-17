import sqlite3
import os

db_path = r'd:\scalegrad\hackathon\jirathon\backend\jirathon.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()
try:
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    print("Tables:", c.fetchall())
    c.execute("SELECT * FROM team_progress")
    print("Rows:", c.fetchall())
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
