package com.chronos;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

public class EncryptionUtils {
    public static String decryptAndGetKey(String ciphertextB64, String password) {
        String teamName = "unknown_team";
        try {
            // Assume the backend is run from project_chronos/backend folder, so .env is at ../.env
            List<String> lines = Files.readAllLines(Paths.get("../.env"));
            for (String line : lines) {
                if (line.startsWith("TEAM_NAME=")) {
                    teamName = line.substring(10).trim();
                    break;
                }
            }
        } catch (Exception e) {}
        
        if ("unknown_team".equals(teamName)) {
            return "ERROR: TEAM_NAME missing in ../.env";
        }
        
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(password.getBytes("UTF-8"));
            
            byte[] ctBytes = Base64.getDecoder().decode(ciphertextB64);
            byte[] iv = new byte[16];
            System.arraycopy(ctBytes, 0, iv, 0, 16);
            byte[] encrypted = new byte[ctBytes.length - 16];
            System.arraycopy(ctBytes, 16, encrypted, 0, encrypted.length);
            
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            
            byte[] decrypted = cipher.doFinal(encrypted);
            String flag = new String(decrypted, "UTF-8");
            
            if (flag.startsWith("flag_")) {
                MessageDigest md5 = MessageDigest.getInstance("MD5");
                md5.update((teamName + "_" + flag).getBytes("UTF-8"));
                byte[] md5Bytes = md5.digest();
                StringBuilder sb = new StringBuilder();
                for (byte b : md5Bytes) sb.append(String.format("%02x", b));
                return sb.toString().substring(0, 6);
            }
        } catch (Exception e) {}
        return "INVALID_STATE_OR_DECRYPTION_FAILED";
    }
}
