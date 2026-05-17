# ==============================================================================
# STAGE 10: THE ASSEMBLY LINE
# ==============================================================================
# The Final subsystem. The Rogue AI built a custom assembly interpreter.
# 
# BUG: The `JMP` instruction is broken. It jumps to the absolute line number 
# instead of relative to the current instruction pointer.
# Fix the interpreter, then run the payload.
#
# If the payload executes correctly, it will generate the FINAL_OVERRIDE_KEY.
#
# USAGE: python stage10_assembly.py <KEY_FROM_STAGE_9>
# ==============================================================================

import sys
import hashlib

def run_interpreter(stage9_key, program):
    registers = {'R1': 0, 'R2': 0}
    ip = 0
    
    while ip < len(program):
        inst = program[ip].split()
        op = inst[0]
        
        if op == "ADD":
            registers[inst[1]] += int(inst[2])
            ip += 1
        elif op == "SUB":
            registers[inst[1]] -= int(inst[2])
            ip += 1
        elif op == "JMP":
            # --- FIX THIS CODE ---
            # BUG: The AI set this to absolute line index. It should be relative!
            # Change this to: ip += int(inst[1])
            ip = int(inst[1]) 
        elif op == "HALT":
            break
        else:
            ip += 1
            
    return registers['R1']

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing Stage 9 Key")
        sys.exit(1)
        
    stage9_key = sys.argv[1]
    
    # Do not modify the payload!
    payload = [
        "ADD R1 10",
        "JMP 2",
        "SUB R1 5", # Skipped
        "ADD R1 42",
        "HALT"
    ]
    
    try:
        result = run_interpreter(stage9_key, payload)
        if result == 52:
            final_hash = hashlib.sha256((stage9_key + "override_success").encode()).hexdigest()
            print("\n========================================================")
            print(" SYSTEM OVERRIDE SUCCESSFUL ")
            print("========================================================")
            print(f"MASTER_OVERRIDE_KEY: {final_hash}")
            print("Submit this key to the Hackathon validator.")
        else:
            print(f"EXECUTION FAILURE: R1 ended with {result}. Expected 52.")
    except Exception as e:
        print("Interpreter crashed. Infinite loop detected?")
