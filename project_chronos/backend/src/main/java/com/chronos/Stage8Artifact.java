// ==============================================================================
// STAGE 8: THE ENCRYPTED ARTIFACT (BACKEND)
// ==============================================================================
// The Chronomancer inverted the data stream.
// 
// BUG: A custom Jackson JSON deserializer fails to parse the incoming payload.
// TRAP: The JSON is perfectly valid syntactically, but the keys and values 
// are intentionally written backwards (e.g., `{"yek": "eulav"}`). 
// You must modify the deserializer to reverse the strings before mapping them.
// ==============================================================================

package com.chronos;

import java.security.MessageDigest;
// Simulated imports for Jackson
// import com.fasterxml.jackson.core.JsonParser;
// import com.fasterxml.jackson.databind.DeserializationContext;
// import com.fasterxml.jackson.databind.JsonDeserializer;

public class Stage8EncryptedArtifact {

    // Simulated payload from frontend
    private static final String INCOMING_JSON = "{\"yek\": \"tcatitra_edirrevo\"}";

    public static String deserializeAndUnlock(String stage7Key) {
        
        // --- FIX THIS CODE ---
        // Simulated custom Deserializer logic.
        // The JSON keys and values are reversed.
        // You need to extract the reversed value of "yek", which is "override_artifact"
        
        String parsedValue = "tcatitra_edirrevo"; // The raw reversed value
        
        // Fix: Reverse the string
        String correctValue = new StringBuilder(parsedValue).reverse().toString();
        
        if (correctValue.equals("override_artifact")) {
             try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                md.update((stage7Key + correctValue).getBytes());
                byte[] digest = md.digest();
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                return sb.toString().substring(0, 10); // Stage 8 Key
            } catch (Exception e) {
                return "ERROR";
            }
        }
        
        return "DESERIALIZATION_FAILURE";
    }

    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println("STAGE 8 KEY: " + deserializeAndUnlock(args[0]));
        }
    }
}
