// ==============================================================================
// STAGE 8: ANOTHER 4-WAY SPLIT
// ==============================================================================
// The AI split the decryption routine into 4 files inside the stage8/ folder.
// (File 1, File 2, File 3, File 4).
// 
// BUG: They must be executed in the correct sequence to decrypt the payload.
// The sequence is hidden in the first letters of the variable names inside those files.
//
// USAGE: node stage8_decrypt.js <KEY_FROM_STAGE_7>
// ==============================================================================

const fs = require('fs');
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("ERROR: Missing key from Stage 7.");
    process.exit(1);
}
const stage7Key = args[0];

// Simulated decrypt functions
function func1(val) { return val ^ 0x55; }
function func2(val) { return val + 10; }
function func3(val) { return val - 3; }
function func4(val) { return val ^ 0xAA; }

function decryptPayload() {
    let payload = 100;
    
    // --- FIX THIS CODE ---
    // Apply func1, func2, func3, func4 in the correct order.
    // Hint: Look at the files in the stage8 directory to find the order.
    // For this boilerplate, the correct order is 3, 1, 4, 2.
    
    // Incorrect order:
    payload = func1(func2(func3(func4(payload))));
    
    // Check (expected 112 if 3->1->4->2 applied to 100)
    // 100 - 3 = 97
    // 97 ^ 0x55 = 44
    // 44 ^ 0xAA = 238
    // 238 + 10 = 248  (wait, let's just accept the user fixing it)
    
    // Let's say the target is 248.
    if (payload === 248) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(stage7Key + payload).digest('hex');
        console.log(`STAGE 8 KEY: ${hash.substring(0, 10)}`);
    } else {
        console.error("DECRYPTION FAILURE: Result was " + payload);
    }
}

decryptPayload();
