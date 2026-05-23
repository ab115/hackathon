import CryptoJS from 'crypto-js';

// RequiresREACT_APP_TEAM_NAME to be set in .env
const teamName = process.env.REACT_APP_TEAM_NAME || "unknown_team";

export const decryptAndGetKey = (ciphertextB64, password) => {
    if (teamName === "unknown_team") return "ERROR: REACT_APP_TEAM_NAME missing in .env";
    
    try {
        const key = CryptoJS.SHA256(String(password));
        const ctWords = CryptoJS.enc.Base64.parse(ciphertextB64);
        
        // Split IV (first 16 bytes = 4 words) and ciphertext
        const iv = CryptoJS.lib.WordArray.create(ctWords.words.slice(0, 4));
        const encrypted = CryptoJS.lib.WordArray.create(ctWords.words.slice(4), ctWords.sigBytes - 16);
        
        const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encrypted });
        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        const flag = decrypted.toString(CryptoJS.enc.Utf8);
        if (flag.startsWith("flag_")) {
            return CryptoJS.MD5(teamName + "_" + flag).toString().substring(0, 6);
        }
    } catch (e) {
        console.error(e);
    }
    return "INVALID_STATE_OR_DECRYPTION_FAILED";
};
