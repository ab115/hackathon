// ==============================================================================
// STAGE 1: THE BROKEN GATEWAY (FRONTEND)
// ==============================================================================
// The Chronomancer sabotaged the primary router. 
// BUG: Every time the user hits the root path, they are redirected to the 404 page.
// 
// You must fix the routing. BUT WAIT! Before you do, the 404 page contains 
// a hidden SVG path. You need to extract the hidden attribute value from that SVG
// and use it as the `key1` for the next stage.
// ==============================================================================

import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

const Gateway404 = () => {
    // The trap: The actual key is hidden in this "invisible" SVG.
    // An LLM might just delete this or fix the routing without noticing it.
    
    // We import decryption logic.
    const { decryptAndGetKey } = require('../encryptionUtils');
    const PC1_CT = "f69eqDMweFSU6ZQvRzAti7UCKaPRBYq7AtiJrxDjqxU=";
    const finalKey1 = decryptAndGetKey(PC1_CT, "1999-12-31T23:59:59Z");
    
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Temporal Rift Detected</h1>
            <svg width="0" height="0" data-hidden-key={finalKey1}>
                <path d="M0 0 H 10 V 10 H 0 Z" />
            </svg>
        </div>
    );
};

const Dashboard = () => <h1>Timeline Restored - Stage 1 Complete</h1>;

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- FIX THIS CODE --- */}
                {/* The chronomancer swapped the routes. Fix them so '/' goes to Dashboard */}
                <Route path="/" element={<Navigate to="/404" />} />
                <Route path="/dashboard" element={<Navigate to="/404" />} />
                <Route path="/404" element={<Gateway404 />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
