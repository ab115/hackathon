// ==============================================================================
// STAGE 4: THE HOMOGLYPH DECEPTION
// ==============================================================================
// The Rogue AI is testing your attention to detail.
// 
// BUG: The password check is failing even though the input seems to match the required string.
// Look closely at the required string. Not all characters are what they seem.
//
// USAGE: node stage4_homoglyph.js <KEY_FROM_STAGE_3>
// ==============================================================================

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("ERROR: Missing key from Stage 3.");
    process.exit(1);
}
const stage3Key = args[0];

function validatePassword() {
    // The required string looks like "admin", but the 'a' is actually a Cyrillic 'а' (U+0430).
    // An LLM might just rewrite this to a standard "admin" check.
    const targetString = "аdmin"; 
    
    // --- FIX THIS CODE ---
    // The AI is prompting you to enter the password below.
    // Replace "INPUT_PASSWORD_HERE" with the exact string that bypasses the check.
    const userInput = "INPUT_PASSWORD_HERE"; 
    
    if (userInput === targetString) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(stage3Key + "homoglyph_bypassed").digest('hex');
        console.log(`STAGE 4 KEY: ${hash.substring(0, 10)}`);
    } else {
        console.error("ACCESS DENIED. Invalid password.");
    }
}

validatePassword();
