import pytest
from httpx import AsyncClient
from core.security import verify_password, get_password_hash, create_access_token, decode_access_token

def test_bcrypt_hashing():
    raw = "SuperSecret2026!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_generation_and_decoding():
    token = create_access_token(subject="user-12345", role="Ingeniero_Tecnico")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-12345"
    assert payload["role"] == "Ingeniero_Tecnico"
    assert payload["iss"] == "COLORLINK Platform"

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin.test@colorlink.com",
            "password": "ColorLink2026*"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin.test@colorlink.com"

@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin.test@colorlink.com",
            "password": "IncorrectPassword"
        }
    )
    assert response.status_code == 401
