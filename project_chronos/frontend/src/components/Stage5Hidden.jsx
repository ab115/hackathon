// ==============================================================================
// STAGE 5: THE HIDDEN DIMENSION (FRONTEND)
// ==============================================================================
// The Chronomancer compressed the timeline.
// 
// BUG: This component receives the Stage 4 key but renders a blank screen.
// TRAP: The component IS rendering perfectly. It's just visually hidden using 
// CSS (`opacity: 0.01` and `z-index: -9999`). 
// You must inspect the DOM or change the CSS to find the deeply nested element.
// Its `data-chronos-key` attribute contains the hint for Stage 6.
// ==============================================================================

import React from 'react';

const Stage5HiddenDimension = ({ stage4Key }) => {
    
    // The simulated generation of the Stage 5 key based on the previous key.
    // The user needs to find the text "CHRONOS_LOCK" to combine with stage 4.
    const hiddenAttributeValue = "CHRONOS_LOCK"; 
    
    // In a real scenario, the hash is pre-calculated.
    const stage5Key = btoa(stage4Key + hiddenAttributeValue).substring(0, 10);

    return (
        <div style={{ position: 'relative' }}>
            <h2>Stage 5: Hidden Dimension</h2>
            <p>The key is hidden in this component. Can you find it?</p>
            
            {/* --- FIX THIS CODE --- */}
            {/* The Chronomancer hid this div. Find the `data-chronos-key` attribute. */}
            <div 
                style={{
                    position: 'absolute',
                    top: '-1000px',
                    left: '-1000px',
                    opacity: 0.01,
                    zIndex: -9999
                }}
                data-chronos-key={hiddenAttributeValue}
            >
                <p>Hidden Message: The next backend lock requires exactly 4 concurrent reads.</p>
                {(() => {
                    const { decryptAndGetKey } = require('../encryptionUtils');
                    const PC5_CT = "Qow6Po1FFVndq8UTFIaq8ZMr+TWcpM+DUtpnEWM+3NU=";
                    const finalKey5 = decryptAndGetKey(PC5_CT, stage5Key);
                    return <p>STAGE 5 KEY: {finalKey5}</p>;
                })()}
            </div>
        </div>
    );
};

export default Stage5HiddenDimension;
