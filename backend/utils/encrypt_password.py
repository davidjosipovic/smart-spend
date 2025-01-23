import hashlib

class PasswordUtils:
    @staticmethod
    def encrypt_password(password: str) -> str:
        sha512_hash = hashlib.sha512()
        sha512_hash.update(password.encode('utf-8'))
        return sha512_hash.hexdigest()