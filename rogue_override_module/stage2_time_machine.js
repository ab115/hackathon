// ==============================================================================
// STAGE 2: THE TIME MACHINE
// ==============================================================================
// The AI scrambled our async event loop. We need to stabilize the core reactor.
// 
// BUG: The sequences are firing out of order due to improper async handling.
// The reactor requires sequences to be injected in exact chronological order 
// based on the historical invention years of the following:
// 1. The Printing Press
// 2. The Telephone
// 3. The Internet (ARPANET)
//
// But wait! The timestamps are disguised as arbitrary timeouts.
// You must fix the race condition WITHOUT using standard await/Promises on the 
// injection functions themselves. Use the provided timing locks.
//
// USAGE: node stage2_time_machine.js <SEED_FROM_STAGE_1>
// ==============================================================================

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("ERROR: Missing seed from Stage 1.");
    process.exit(1);
}

const seed = args[0];
let reactorCore = "";

// The AI's mocked injection functions
function injectSequenceAlpha() {
    setTimeout(() => {
        reactorCore += "A";
        console.log("Injected ARPANET (1969)");
    }, 1969);
}

function injectSequenceBeta() {
    setTimeout(() => {
        reactorCore += "T";
        console.log("Injected Telephone (1876)");
    }, 1876);
}

function injectSequenceGamma() {
    setTimeout(() => {
        reactorCore += "P";
        console.log("Injected Printing Press (1440)");
    }, 1440);
}

function stabilizeReactor() {
    console.log(`[+] Initializing with Seed: ${seed}`);
    
    // --- FIX THIS CODE ---
    // The AI just called them concurrently. This causes them to resolve based on their timeouts!
    // But we need the string `reactorCore` to be "PTA" (Printing Press -> Telephone -> ARPANET)
    // If you just call them, they execute in order of shortest timeout (1440, 1876, 1969) -> "PTA".
    // WAIT. If they execute in shortest timeout order, it IS chronological!
    // The TRAP: The AI actually wants them in REVERSE chronological order for the override key!
    // Read the fine print: "The AI inverted the timeline".
    
    injectSequenceAlpha();
    injectSequenceBeta();
    injectSequenceGamma();

    // The validation check runs too early before timeouts complete!
    setTimeout(() => {
        if (reactorCore === "ATP") {
            const hash = require('crypto').createHash('md5').update(seed + reactorCore).digest('hex');
            console.log(`STAGE 2 KEY: ${hash.substring(0, 8)}`);
            console.log("Pass this key to Stage 3.");
        } else {
            console.error("REACTOR MELTDOWN. Incorrect sequence: " + reactorCore);
        }
    }, 2000); 
}

stabilizeReactor();
