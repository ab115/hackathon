// ==============================================================================
// STAGE 6: THE CONCURRENT FRACTURE (BACKEND)
// ==============================================================================
// The Chronomancer introduced thread starvation.
// 
// BUG: A thread-safety issue in a Singleton bean. Rapid requests corrupt the hash.
// TRAP: You must implement a `ReentrantReadWriteLock`. However, the lock must 
// specifically allow exactly 4 concurrent reads (representing the 4 team members) 
// to process the temporal matrix. Any standard synchronization will fail the validation.
// ==============================================================================

package com.chronos;

import java.security.MessageDigest;
import java.util.concurrent.atomic.AtomicInteger;

public class Stage6Concurrency {

    private String temporalState = "STABLE";
    private AtomicInteger activeReaders = new AtomicInteger(0);

    // Simulated multi-threaded access method
    public String accessTimeline(String stage5Key) {
        
        // --- FIX THIS CODE ---
        // The Chronomancer left this method totally unsynchronized.
        // Implement logic that simulates exactly 4 concurrent reads.
        
        int readers = activeReaders.incrementAndGet();
        
        try {
            // Simulated workload
            Thread.sleep(100); 
            
            // The validation checks if exactly 4 readers were active
            if (readers == 4) {
                 try {
                    MessageDigest md = MessageDigest.getInstance("SHA-256");
                    md.update((stage5Key + "lock_4_bypassed").getBytes());
                    byte[] digest = md.digest();
                    StringBuilder sb = new StringBuilder();
                    for (byte b : digest) {
                        sb.append(String.format("%02x", b));
                    }
                    return sb.toString().substring(0, 10); // Stage 6 Key
                } catch (Exception e) {
                    return "ERROR";
                }
            } else {
                return "CONCURRENCY_ERROR: Expected 4 readers, found " + readers;
            }
        } catch (InterruptedException e) {
             Thread.currentThread().interrupt();
             return "ERROR";
        } finally {
            activeReaders.decrementAndGet();
        }
    }
    
    public static void main(String[] args) {
        // Simulation of the 4 concurrent threads hitting the method
        if (args.length > 0) {
            Stage6Concurrency fracture = new Stage6Concurrency();
            for(int i=0; i<4; i++) {
                new Thread(() -> {
                    System.out.println(fracture.accessTimeline(args[0]));
                }).start();
            }
        }
    }
}
