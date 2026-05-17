import sys
import hashlib

# Note: In a real environment, this hash would be on the backend.
# This script just simulates the backend check for local testing.
EXPECTED_MASTER_HASH = "9cc49f98ffc9205d7be4080607669b83fe7c9760916a23612115af85ede31d7d" # Actual hash

def validate_key(key):
    # In a real scenario, we don't know the exact hash beforehand unless we solve it ourselves,
    # but for the sake of the puzzle structure, we assume the backend validates it.
    print(f"Validating KEY: {key}...")
    # This is a placeholder validation.
    if len(key) == 64:
        print("[+] Checksum length OK.")
        print("[+] Attempting Server Override...")
        print("...")
        print("OVERRIDE ACCEPTED. AI CONTAINED.")
    else:
        print("[-] Invalid Key format. Must be a 64-character SHA-256 hash.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python core_validator.py <MASTER_OVERRIDE_KEY>")
        sys.exit(1)
        
    validate_key(sys.argv[1])
