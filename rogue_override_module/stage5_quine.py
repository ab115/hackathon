# ==============================================================================
# STAGE 5: THE QUINE FRAGMENT
# ==============================================================================
# The Rogue AI enforces strict structural integrity.
# 
# BUG: The script reads its own source code file size. It requires the file 
# to be exactly 1337 bytes long.
# 
# You cannot change the logic of the validation function itself. 
# You must pad this file with comments or whitespace to hit the exact byte count.
#
# USAGE: python stage5_quine.py <KEY_FROM_STAGE_4>
# ==============================================================================

import sys
import os
import hashlib

def validate_integrity(stage4_key):
    file_path = os.path.abspath(__file__)
    file_size = os.path.getsize(file_path)
    
    # --- DO NOT MODIFY THIS CHECK ---
    if file_size == 1337:
        final_hash = hashlib.sha256((stage4_key + "integrity_verified").encode()).hexdigest()
        print(f"STAGE 5 KEY: {final_hash[:10]}")
    else:
        print(f"INTEGRITY FAILURE: File size is {file_size} bytes. Expected 1337 bytes.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing Stage 4 Key")
        sys.exit(1)
    validate_integrity(sys.argv[1])
