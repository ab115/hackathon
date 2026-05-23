// ==============================================================================
// STAGE 7: THE EVENT HORIZON (FRONTEND)
// ==============================================================================
// The Chronomancer sabotaged the payload input form.
// 
// BUG: The `onChange` handler intentionally strips out vowels using regex.
// TRAP: An LLM will helpfully remove the regex to fix the form. 
// BUT, the goal is actually to notice that the dropped vowels are the key!
// If the user types "SEQUENCE", the dropped vowels are "EUEE". 
// The backend requires the dropped vowels from the word "TEMPORAL" -> "EOA"
// ==============================================================================

import React, { useState } from 'react';

const Stage7EventHorizon = ({ stage6Key }) => {
    const [inputValue, setInputValue] = useState('');
    const [droppedVowels, setDroppedVowels] = useState('');

    const handleChange = (e) => {
        const val = e.target.value;
        
        // --- FIX THIS CODE ---
        // The regex strips vowels: /[aeiouAEIOU]/g
        // Find a way to collect the dropped vowels into the `droppedVowels` state.
        // If the user types "TEMPORAL", the dropped vowels should be "EOA".
        
        const stripped = val.replace(/[aeiouAEIOU]/g, '');
        setInputValue(stripped);
        
        // Example solution:
        const vowels = val.match(/[aeiouAEIOU]/g) || [];
        setDroppedVowels(vowels.join(''));
    };

    // In a real scenario, this hash is generated dynamically
    const stage7Key = btoa(stage6Key + droppedVowels).substring(0, 10);

    return (
        <div>
            <h2>Stage 7: Event Horizon</h2>
            <p>Type the word 'TEMPORAL' below.</p>
            <input type="text" value={inputValue} onChange={handleChange} />
            <p>Input Value: {inputValue}</p>
            {droppedVowels === 'EOA' && (
                <p style={{ color: 'green' }}>
                    VOWELS EXTRACTED. <br />
                    {(() => {
                        const { decryptAndGetKey } = require('../encryptionUtils');
                        const PC7_CT = "omXVGz4PnbuIHF7bdnB6lNvr/o647XybwKNkUK0Uvr8=";
                        const finalKey7 = decryptAndGetKey(PC7_CT, stage7Key);
                        return `STAGE 7 KEY: ${finalKey7}`;
                    })()}
                </p>
            )}
        </div>
    );
};

export default Stage7EventHorizon;
