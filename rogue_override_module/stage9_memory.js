// ==============================================================================
// STAGE 9: THE MEMORY LEAK
// ==============================================================================
// The Rogue AI left a deliberate memory leak here.
// 
// BUG: The code crashes due to out-of-memory. An LLM will easily fix the leak.
// HOWEVER, the key for the next stage is the exact iteration number where it 
// *would* have crashed, assuming a strict 64KB memory limit per the problem statement.
//
// Let's assume each object added to the array is exactly 32 bytes.
// Calculate the exact number of iterations it takes to exceed 64KB (65536 bytes).
//
// USAGE: node stage9_memory.js <KEY_FROM_STAGE_8>
// ==============================================================================

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("ERROR: Missing key from Stage 8.");
    process.exit(1);
}
const stage8Key = args[0];

function calculateCrashPoint() {
    // --- FIX THIS CODE ---
    // Do not run the infinite loop. Calculate the target mathematically.
    // 65536 / 32 = 2048. So it crashes on iteration 2048 or 2049 depending on how you count.
    // The exact answer required here is 2049 (the first iteration to EXCEED 64KB).
    const targetIteration = 0; 
    
    if (targetIteration === 2049) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(stage8Key + "oom_calculated").digest('hex');
        console.log(`STAGE 9 KEY: ${hash.substring(0, 10)}`);
    } else {
        console.error("CALCULATION FAILURE: Wrong iteration count. You got " + targetIteration);
    }
}

calculateCrashPoint();
