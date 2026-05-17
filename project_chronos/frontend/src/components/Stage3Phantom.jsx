// ==============================================================================
// STAGE 3: THE PHANTOM STATE (FRONTEND)
// ==============================================================================
// The Chronomancer introduced a memory leak and infinite render loop.
// 
// BUG: The `useEffect` keeps firing infinitely. 
// Standard LLM advice is to "add an empty dependency array []". 
// TRAP: Doing that will break the temporal sync. You actually need the effect to 
// run exactly once, BUT it must return a specific cleanup function that dispatches 
// a CustomEvent named 'temporal_shift' containing the Stage 2 key.
// ==============================================================================

import React, { useState, useEffect } from 'react';

const Stage3PhantomState = ({ stage2Key }) => {
    const [syncCount, setSyncCount] = useState(0);
    const [finalHash, setFinalHash] = useState("");

    // --- FIX THIS CODE ---
    useEffect(() => {
        // The bug: Updates state unconditionally without a dependency array, causing a loop.
        // setSyncCount(syncCount + 1); 
        
        // TRAP FIX: 
        // 1. Add the empty dependency array.
        // 2. Return the specific cleanup function below.
        
        return () => {
            // The team must write this cleanup function:
            const event = new CustomEvent('temporal_shift', { detail: stage2Key });
            window.dispatchEvent(event);
        };
    }); // <--- Missing dependency array here

    // Hidden validator that listens for the specific event to generate Stage 3 key
    useEffect(() => {
        const handleShift = (e) => {
            if (e.detail === stage2Key) {
                // Simulated hashing logic for frontend
                const hash = btoa(stage2Key + "phantom_bypassed").substring(0, 10);
                setFinalHash(hash);
            }
        };
        window.addEventListener('temporal_shift', handleShift);
        return () => window.removeEventListener('temporal_shift', handleShift);
    }, [stage2Key]);

    return (
        <div>
            <h2>Stage 3: Phantom State</h2>
            <p>Sync Count: {syncCount}</p>
            {finalHash ? <p>STAGE 3 KEY: {finalHash}</p> : <p>Waiting for temporal shift...</p>}
        </div>
    );
};

export default Stage3PhantomState;
