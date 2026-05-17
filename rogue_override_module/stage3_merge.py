# ==============================================================================
# STAGE 3: THE 4-WAY SPLIT
# ==============================================================================
# The Rogue AI shattered the next key into 4 pieces, hidden in the stage3/ folder.
# It claims: "You cannot merge what you do not understand. Time is the only truth."
#
# BUG: The merge order below is arbitrary and fails the checksum.
# You must import the 4 parts and concatenate them in the chronological order 
# of the birth years of the scientists they are named after.
#
# USAGE: python stage3_merge.py <KEY_FROM_STAGE_2>
# ==============================================================================

import sys
import hashlib
from stage3 import alpha, beta, gamma, delta

def merge_keys(stage2_key):
    # --- FIX THIS CODE ---
    # The AI just concatenated them alphabetically. 
    # You need to arrange them chronologically by birth year!
    # Ada Lovelace (1815) -> Grace Hopper (1906) -> Alan Turing (1912) -> Tim Berners-Lee (1955)
    # i.e., beta -> gamma -> alpha -> delta
    
    merged_string = alpha.get_part() + beta.get_part() + gamma.get_part() + delta.get_part()
    
    # Checksum validation (don't change this)
    final_hash = hashlib.sha256((stage2_key + merged_string).encode()).hexdigest()
    
    # The correct prefix for the next stage should start with '0000' if sorted correctly 
    # (Note: simulated for this puzzle).
    print(f"STAGE 3 KEY: {final_hash[:10]}")
    print("Pass this key to Stage 4.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing Stage 2 Key")
        sys.exit(1)
    merge_keys(sys.argv[1])
