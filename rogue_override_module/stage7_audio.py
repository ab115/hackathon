# ==============================================================================
# STAGE 7: THE AUDIO VISUALIZER
# ==============================================================================
# The Rogue AI corrupted a visual matrix.
# 
# BUG: The matrix prints to the console, but the string validation fails.
# The 2x3 matrix visually represents a Braille character when O = raised, . = flat.
#
# MATRIX:
# O .
# O O
# . O
#
# You must identify what Braille character this is and set `braille_char` to it.
# LLMs will try to optimize the loops or parse the array, but they can't "see" it.
#
# USAGE: python stage7_audio.py <KEY_FROM_STAGE_6>
# ==============================================================================

import sys
import hashlib

def parse_matrix(stage6_key):
    matrix = [
        ['O', '.'],
        ['O', 'O'],
        ['.', 'O']
    ]
    
    for row in matrix:
        print(" ".join(row))
        
    # --- FIX THIS CODE ---
    # What letter does the above Braille matrix represent?
    braille_char = "?" 
    
    if braille_char.lower() == 's': # Spoiler: it's 's'
        final_hash = hashlib.sha256((stage6_key + "braille_s").encode()).hexdigest()
        print(f"STAGE 7 KEY: {final_hash[:10]}")
    else:
        print("VISION FAILURE: Incorrect character identified.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing Stage 6 Key")
        sys.exit(1)
    parse_matrix(sys.argv[1])
