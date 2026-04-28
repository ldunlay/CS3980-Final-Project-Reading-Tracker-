import bcrypt


def hash_password(password: str) -> bytes:
    password_bytes = password.encode()
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed


def verify_password(input_password: str, db_password: str) -> bool:
    return bcrypt.checkpw(input_password.encode(), db_password.encode())
