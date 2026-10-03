from fastapi import APIRouter, Depends, Query, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from schemas.client import ClientCreate, ClientUpdate, ClientOut
from services.client_service import ClientService

router = APIRouter()

@router.post("/", response_model=ClientOut, status_code=status.HTTP_201_CREATED, summary="Crear cliente corporativo")
async def create_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    service = ClientService(db)
    return await service.create_client(client_in)

@router.get("/", response_model=List[ClientOut], summary="Listar clientes corporativos")
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    service = ClientService(db)
    return await service.get_all_clients(skip=skip, limit=limit)

@router.get("/{client_id}", response_model=ClientOut, summary="Obtener cliente por ID")
async def get_client(client_id: str, db: AsyncSession = Depends(get_db)):
    service = ClientService(db)
    return await service.get_client_by_id(client_id)

@router.put("/{client_id}", response_model=ClientOut, summary="Actualizar información de cliente")
async def update_client(client_id: str, client_in: ClientUpdate, db: AsyncSession = Depends(get_db)):
    service = ClientService(db)
    return await service.update_client(client_id, client_in)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar cliente")
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db)):
    service = ClientService(db)
    await service.delete_client(client_id)
    return None
