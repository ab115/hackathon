// ==============================================================================
// STAGE 9: QUANTUM ENTANGLEMENT (FRONTEND)
// ==============================================================================
// The Chronomancer split the key across two entangled components.
// 
// BUG: A race condition makes them out of sync. 
// TRAP: They must be updated to the EXACT same timestamp within 42 milliseconds 
// of each other. If you just call `setState` consecutively, React batching 
// usually works, but the Chronomancer added a random `setTimeout` delay to one.
// You must force them to sync by overriding the delay or using a shared ref.
// ==============================================================================

import React, { useState, useRef } from 'react';

const Stage9QuantumEntanglement = ({ stage8Key }) => {
    const [timeA, setTimeA] = useState(0);
    const [timeB, setTimeB] = useState(0);
    const [finalKey, setFinalKey] = useState("");

    const triggerSync = () => {
        const now = Date.now();
        
        // --- FIX THIS CODE ---
        // The Chronomancer's random delay breaks the entanglement.
        // Remove or bypass the delay so both states update with the exact same `now` value.
        
        setTimeA(now);
        
        setTimeout(() => {
            setTimeB(now); // Currently delayed by 100ms
        }, 100); 
    };

    // Validation Check
    React.useEffect(() => {
        if (timeA > 0 && timeB > 0) {
            const diff = Math.abs(timeA - timeB);
            // This validation requires them to be perfectly synced (diff == 0)
            // But because of the timeout above, they are out of sync.
            // Wait, actually `now` is captured before the timeout. 
            // The TRAP is that `timeB` updates 100ms LATER, so if the validation 
            // runs immediately when `timeA` updates, `timeB` is still 0!
            
            if (timeA === timeB) {
                const stage9Key = btoa(stage8Key + "entangled").substring(0, 10);
                setFinalKey(stage9Key);
            }
        }
    }, [timeA, timeB, stage8Key]);

    return (
        <div>
            <h2>Stage 9: Quantum Entanglement</h2>
            <button onClick={triggerSync}>Sync Timelines</button>
            <p>Time A: {timeA}</p>
            <p>Time B: {timeB}</p>
            {finalKey && (
                (() => {
                    const { decryptAndGetKey } = require('../encryptionUtils');
                    const PC9_CT = "H3Ily9kwIwr7Yfoxk4tOWdvNui/JeDyDefw+euf3x4c=";
                    const stage9Key = decryptAndGetKey(PC9_CT, finalKey);
                    return <p style={{ color: 'blue' }}>STAGE 9 KEY: {stage9Key}</p>;
                })()
            )}
        </div>
    );
};

export default Stage9QuantumEntanglement;
