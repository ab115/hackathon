import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import base64
import os

TEAM_NAME = os.getenv("TEAM_NAME", "unknown_team")

def decrypt_and_get_key(ciphertext_b64: str, state_material: str) -> str:
    if TEAM_NAME == "unknown_team":
        return "ERROR: TEAM_NAME missing in .env"
    try:
        key = hashlib.sha256(str(state_material).encode()).digest()
        ct = base64.b64decode(ciphertext_b64)
        iv = ct[:16]
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_pt = decryptor.update(ct[16:]) + decryptor.finalize()
        
        unpadder = padding.PKCS7(128).unpadder()
        flag = unpadder.update(padded_pt) + unpadder.finalize()
        flag_str = flag.decode('utf-8')
        
        if flag_str.startswith("flag_"):
            return hashlib.md5(f"{TEAM_NAME}_{flag_str}".encode()).hexdigest()[:6]
    except Exception:
        pass
    return "INVALID_STATE_OR_DECRYPTION_FAILED"
