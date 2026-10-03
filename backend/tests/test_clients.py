import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_and_list_clients(client: AsyncClient):
    # 1. Crear Cliente Corporativo
    new_client = {
        "tax_id": "NIT-900889911-3",
        "company_name": "Ecopetrol Refinería Cartagena",
        "contact_name": "Ing. Carlos Mendoza",
        "email": "carlos.mendoza@ecopetrol.com.co",
        "phone": "+57 310 9988776",
        "city": "Cartagena",
        "address": "Zona Industrial Mamonal Km 12",
        "industry_sector": "Petróleo y Gas",
        "status": "Activo"
    }
    create_res = await client.post("/api/v1/clients/", json=new_client)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["tax_id"] == new_client["tax_id"]
    assert "id" in created_data

    # 2. Listar Clientes
    list_res = await client.get("/api/v1/clients/")
    assert list_res.status_code == 200
    clients_list = list_res.json()
    assert len(clients_list) >= 1
    assert any(c["tax_id"] == "NIT-900889911-3" for c in clients_list)

@pytest.mark.asyncio
async def test_duplicate_tax_id_rejected(client: AsyncClient):
    duplicate_payload = {
        "tax_id": "NIT-DUPLICATE-99",
        "company_name": "Empresa A",
        "contact_name": "Contacto A",
        "email": "a@empresa.com",
        "phone": "3001112233",
        "city": "Bogotá",
        "industry_sector": "Construcción"
    }
    # Primera creación
    res1 = await client.post("/api/v1/clients/", json=duplicate_payload)
    assert res1.status_code == 201

    # Segunda creación con mismo NIT debe fallar con 400
    res2 = await client.post("/api/v1/clients/", json=duplicate_payload)
    assert res2.status_code == 400
    assert "NIT" in res2.json()["detail"] or "tax_id" in res2.json()["detail"]
