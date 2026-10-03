from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from models.client import Client
from schemas.client import ClientCreate, ClientUpdate
from repositories.client_repo import ClientRepository

class ClientService:
    def __init__(self, db: AsyncSession):
        self.repo = ClientRepository(db)

    async def create_client(self, client_in: ClientCreate) -> Client:
        existing = await self.repo.get_by_tax_id(client_in.tax_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un cliente registrado con NIT / Identificación: {client_in.tax_id}"
            )
        
        client_db = Client(**client_in.model_dump())
        return await self.repo.create(client_db)

    async def get_all_clients(self, skip: int = 0, limit: int = 100) -> List[Client]:
        return await self.repo.get_all(skip, limit)

    async def get_client_by_id(self, client_id: str) -> Client:
        client = await self.repo.get_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado."
            )
        return client

    async def update_client(self, client_id: str, client_in: ClientUpdate) -> Client:
        client = await self.get_client_by_id(client_id)
        return await self.repo.update(client, client_in.model_dump(exclude_unset=True))

    async def delete_client(self, client_id: str) -> bool:
        client = await self.get_client_by_id(client_id)
        return await self.repo.delete(client.id)
