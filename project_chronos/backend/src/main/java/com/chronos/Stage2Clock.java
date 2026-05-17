// ==============================================================================
// STAGE 2: THE DESYNCHRONIZED CLOCK (BACKEND)
// ==============================================================================
// The Chronomancer locked the API with a temporal epoch constraint.
// 
// BUG: The token validation fails because it checks against a hardcoded year.
// You must fix the temporal injection. The correct timestamp to unlock the hash 
// must match the exact Unix epoch of the Y2K bug (which was the clue from Stage 1).
// ==============================================================================

package com.chronos;

import java.security.MessageDigest;
import java.time.Instant;

public class Stage2Clock {

    public static String validateTemporalEpoch(String stage1Key) {
        
        // --- FIX THIS CODE ---
        // The Chronomancer hardcoded a random instant. 
        // You need to replace this with the exact Instant of the Stage 1 hidden key 
        // ("1999-12-31T23:59:59Z") converted to epoch seconds.
        long correctEpochSeconds = 1609459200L; // Incorrect! This is 2021.
        
        // The correct Y2K epoch is 946684799L
        
        if (correctEpochSeconds == 946684799L) {
            try {
                MessageDigest md = MessageDigest.getInstance("MD5");
                md.update((stage1Key + correctEpochSeconds).getBytes());
                byte[] digest = md.digest();
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                return sb.toString().substring(0, 8); // Stage 2 Key
            } catch (Exception e) {
                return "ERROR";
            }
        }
        
        return "TEMPORAL_DESYNC_ERROR";
    }

    public static void main(String[] args) {
        // Usage: java Stage2Clock <STAGE_1_KEY>
        if (args.length > 0) {
            System.out.println("STAGE 2 KEY: " + validateTemporalEpoch(args[0]));
        } else {
            System.out.println("Missing Stage 1 Key");
        }
    }
}
