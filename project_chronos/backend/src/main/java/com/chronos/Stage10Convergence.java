// ==============================================================================
// STAGE 10: TEMPORAL CONVERGENCE (BACKEND)
// ==============================================================================
// The final convergence.
// 
// BUG: The backend expects an HMAC signature header from the frontend.
// TRAP: The Java backend has a bug in its Filter chain where it attempts to 
// decode the incoming Hex signature as Base64. 
// You must either fix the backend to read Hex, or encode the frontend payload in Base64.
// Both sides must align to reveal the MASTER_TIMELINE_KEY.
// ==============================================================================

package com.chronos;

import java.security.MessageDigest;
import java.util.Base64;

public class Stage10Convergence {

    public static String validateMasterSync(String stage9Key, String incomingSignature) {
        
        // --- FIX THIS CODE ---
        // The incoming signature is Hex (e.g. "a1b2c3d4"), but the chronomancer 
        // forces a Base64 decode here, which crashes or yields garbage.
        try {
            // BUG: 
            byte[] decodedBytes = Base64.getDecoder().decode(incomingSignature);
            
            // Expected validation logic
            // The true signature is the SHA-256 hash of stage9Key + "convergence"
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update((stage9Key + "convergence").getBytes());
            byte[] digest = md.digest();
            
            // To pass, the decodedBytes must match the digest.
            boolean match = true;
            for (int i = 0; i < digest.length; i++) {
                if (decodedBytes[i] != digest[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                 // Final Master Hash Generation
                 MessageDigest finalMd = MessageDigest.getInstance("SHA-256");
                 finalMd.update((stage9Key + "MASTER_OVERRIDE").getBytes());
                 byte[] finalDigest = finalMd.digest();
                 StringBuilder sb = new StringBuilder();
                 for (byte b : finalDigest) {
                     sb.append(String.format("%02x", b));
                 }
                 return sb.toString(); // Length 64 Master Key
            }
            
        } catch (IllegalArgumentException e) {
            return "CONVERGENCE_FAILURE: Invalid Base64 Encoding";
        } catch (Exception e) {
            return "ERROR";
        }
        
        return "CONVERGENCE_FAILURE: Signature Mismatch";
    }

    public static void main(String[] args) {
        if (args.length > 1) {
            String stateValue = validateMasterSync(args[0], args[1]);
            String PC10_CT = "cRX1h3ziKBlpKA73lgQcL0U6OZ8q4ruIUemVzgOu4vg=";
            System.out.println("STAGE 10 KEY: " + EncryptionUtils.decryptAndGetKey(PC10_CT, stateValue));
        } else {
            System.out.println("Usage: java Stage10Convergence <STAGE_9_KEY> <BASE64_SIGNATURE>");
        }
    }
}
