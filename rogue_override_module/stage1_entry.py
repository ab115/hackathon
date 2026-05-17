import json

# ==============================================================================
# STAGE 1: THE ENTRY POINT
# ==============================================================================
# The Rogue AI has hidden the initial seed in a nested configuration matrix.
# It claims: "Standard tree traversal will fail. Only a human can see the path."
#
# THE MAZE TO THE SEED:
#   Start(S) -> East -> South -> East -> North -> The Target(X)
#
#   +---+---+---+
#   | S |   | X |
#   +---+---+---+
#   |   |   |   |
#   +---+---+---+
#   |   |   |   |
#   +---+---+---+
#
# BUG: The current parser just grabs the first string it finds. 
# Fix it to extract the string at the location marked 'X' based on the maze directions.
# Hint: In the nested dictionary, keys are directional movements (e.g., 'E' for East).
# ==============================================================================

config_data = """
{
    "E": {
        "S": {
            "E": {
                "N": {
                    "value": "73c2a1"
                },
                "S": {
                    "value": "trap1"
                }
            },
            "W": {
                "value": "trap2"
            }
        },
        "E": {
            "value": "trap3"
        }
    },
    "S": {
        "value": "trap4"
    }
}
"""

def get_initial_seed():
    matrix = json.loads(config_data)
    
    # --- FIX THIS CODE ---
    # The AI left a lazy greedy traversal here. It's wrong.
    try:
        # BUG: Currently returns "trap3" or crashes.
        # You need to return the value at 'X' using the maze path.
        current_node = matrix
        for key in current_node.keys():
            if isinstance(current_node[key], dict):
                current_node = current_node[key]
            else:
                return current_node[key]
    except Exception:
        pass
    
    return "000000"

if __name__ == "__main__":
    seed = get_initial_seed()
    print(f"STAGE 1 SEED: {seed}")
    print("Pass this seed as the argument to Stage 2.")
