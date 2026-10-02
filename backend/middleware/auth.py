from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from utils.security import decode_access_token

security = HTTPBearer(auto_error=False)


async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        return None

    return {
        "user_id": payload.get("user_id"),
        "email": payload.get("email"),
        "role": payload.get("role"),
    }


async def require_admin(request: Request):
    user = await get_current_user(request)

    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return user