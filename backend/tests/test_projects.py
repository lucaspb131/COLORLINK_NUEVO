import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_project_with_areas_and_timeline(client: AsyncClient):
    # 1. Crear cliente previo
    client_res = await client.post("/api/v1/clients/", json={
        "tax_id": "NIT-PROJECT-TEST-1",
        "company_name": "Industrias del Caribe S.A.",
        "contact_name": "Valeria Rios",
        "email": "vrios@indcaribe.com",
        "phone": "+57 301 5556677",
        "city": "Barranquilla",
        "industry_sector": "Portuario"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["id"]

    # 2. Crear proyecto con áreas y condiciones
    project_payload = {
        "title": "Recubrimiento Anticorrosivo Muelles 3 y 4",
        "client_id": client_id,
        "city": "Barranquilla",
        "project_type": "Marítimo / Portuario",
        "priority": "Alta",
        "budget_estimated": 45000000,
        "status": "Borrador",
        "deadline": "2026-11-30",
        "areas": [
            {
                "name": "Pilotes de Acero Sumergidos",
                "substrate": "Acero Estructural ASTM A36",
                "sqm": 850.5,
                "location": "Zona de Mareas / Salpique",
                "height_meters": 6.5,
                "initial_condition": "Corrosión Grado C con picaduras"
            },
            {
                "name": "Vigas Superiores de Concreto",
                "substrate": "Concreto Reforzado",
                "sqm": 420.0,
                "location": "Exterior Costero",
                "height_meters": 4.0,
                "initial_condition": "Nuevo sin pintar"
            }
        ],
        "conditions": {
            "humidity": 88.5,
            "ambient_temp": 32.0,
            "surface_temp": 36.5,
            "corrosivity": "CX Extrema Marina",
            "chemical_exposure": ["Niebla Salina", "Hidrocarburos"],
            "traffic_type": "Tráfico Pesado Grúas",
            "uv_exposure": "Radiación Solar Directa Extrema"
        }
    }

    create_proj_res = await client.post("/api/v1/projects/", json=project_payload)
    assert create_proj_res.status_code == 201
    proj_data = create_proj_res.json()
    assert proj_data["code"].startswith("COL-2026-")
    assert proj_data["total_sqm"] == 1270.5  # 850.5 + 420.0
    assert len(proj_data["areas"]) == 2
    assert proj_data["conditions"]["corrosivity"] == "CX Extrema Marina"
    assert len(proj_data["timeline"]) >= 1
    assert proj_data["timeline"][0]["status"] == "Borrador"

    project_id = proj_data["id"]

    # 3. Transición de estado con auditoría
    status_res = await client.patch(
        f"/api/v1/projects/{project_id}/status",
        json={
            "status": "Validación Técnica",
            "notes": "Parámetros ambientales y salinidad verificados en campo por NACE Inspector.",
            "author_name": "Ing. Roberto Peña",
            "author_role": "Inspector NACE Nivel 2"
        }
    )
    assert status_res.status_code == 200
    updated_proj = status_res.json()
    assert updated_proj["status"] == "Validación Técnica"

    # 4. Verificar evento en la línea de tiempo
    timeline_res = await client.get(f"/api/v1/projects/{project_id}/timeline")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 2
    assert timeline[-1]["status"] == "Validación Técnica"
    assert timeline[-1]["author_role"] == "Inspector NACE Nivel 2"
