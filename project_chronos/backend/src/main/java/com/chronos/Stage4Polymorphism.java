// ==============================================================================
// STAGE 4: THE POLYMORPHIC PARADOX (BACKEND)
// ==============================================================================
// The Chronomancer scrambled the dependency injection.
// 
// BUG: The Spring @Qualifier is injecting the wrong service implementation.
// TRAP: Fixing the qualifier to inject the "CorrectService" isn't enough. 
// You must instantiate BOTH services manually and combine their string outputs 
// using a custom bitwise XOR operation to get the true hash.
// ==============================================================================

package com.chronos;

import java.security.MessageDigest;

// Interface
interface TemporalService {
    String getTimeSignature();
}

// Implementations
class PastServiceImpl implements TemporalService {
    public String getTimeSignature() { return "ALPHA_DECAY"; }
}

class FutureServiceImpl implements TemporalService {
    public String getTimeSignature() { return "OMEGA_BIRTH"; }
}

public class Stage4Polymorphism {

    // Simulated Spring Injection
    // @Autowired
    // @Qualifier("pastServiceImpl") // The bug: Wrong qualifier
    private TemporalService injectedService;

    public Stage4Polymorphism(TemporalService service) {
        this.injectedService = service;
    }

    public static String resolveParadox(String stage3Key) {
        // --- FIX THIS CODE ---
        // You cannot just use one service. You must get both outputs.
        TemporalService past = new PastServiceImpl();
        TemporalService future = new FutureServiceImpl();
        
        // The Chronomancer wants them XOR'd. (Simulated XOR for string here)
        String combined = past.getTimeSignature() + "_" + future.getTimeSignature();
        
        if (combined.equals("ALPHA_DECAY_OMEGA_BIRTH")) {
             try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                md.update((stage3Key + combined).getBytes());
                byte[] digest = md.digest();
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                return sb.toString().substring(0, 10); // Stage 4 Key
            } catch (Exception e) {
                return "ERROR";
            }
        }
        
        return "INJECTION_FAILURE";
    }
    
    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println("STAGE 4 KEY: " + resolveParadox(args[0]));
        }
    }
}
