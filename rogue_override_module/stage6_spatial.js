// ==============================================================================
// STAGE 6: THE SPATIAL SORT
// ==============================================================================
// The Rogue AI scrambled the activation array.
// 
// BUG: The array ['s', 'q', 'a', 'w', 'd', 'e'] needs to be sorted.
// Standard alphabetical sorting yields ['a', 'd', 'e', 'q', 's', 'w'] which is WRONG.
// The AI sorted them based on their physical position on a standard QWERTY keyboard,
// reading left-to-right, top-to-bottom.
//
// You must implement the custom sorting logic to match the physical layout.
//
// USAGE: node stage6_spatial.js <KEY_FROM_STAGE_5>
// ==============================================================================

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("ERROR: Missing key from Stage 5.");
    process.exit(1);
}
const stage5Key = args[0];

function spatialSort() {
    let arr = ['s', 'q', 'a', 'w', 'd', 'e'];
    
    // --- FIX THIS CODE ---
    // Implement the physical QWERTY sort here.
    // Expected order: q, w, e, a, s, d
    arr.sort(); // This is standard alphabetical. It will fail.
    
    const result = arr.join('');
    
    if (result === 'qweasd') {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(stage5Key + result).digest('hex');
        console.log(`STAGE 6 KEY: ${hash.substring(0, 10)}`);
    } else {
        console.error("SORT FAILURE: Incorrect spatial alignment -> " + result);
    }
}

spatialSort();
