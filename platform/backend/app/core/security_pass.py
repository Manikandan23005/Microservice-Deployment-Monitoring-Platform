# --- Secure Password Hashing Module ---
import hashlib
import os
import secrets
from typing import Tuple

def hash_password(password: str) -> str:
    """Hashes passwords securely using PBKDF2-HMAC-SHA256 with 100,000 iterations and a random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2_sha256$100000${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored hashed string."""
    if not hashed_password:
        return False

    # Handle plaintext legacy fallback for initial dev compatibility if any
    if not hashed_password.startswith("pbkdf2_sha256$"):
        return plain_password == hashed_password

    try:
        parts = hashed_password.split("$")
        if len(parts) != 4:
            return False
        iterations = int(parts[1])
        salt = parts[2]
        stored_key_hex = parts[3]

        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return secrets.compare_digest(key.hex(), stored_key_hex)
    except Exception:
        return False
