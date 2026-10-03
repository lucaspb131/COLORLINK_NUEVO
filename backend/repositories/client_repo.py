from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.client import Client
from repositories.base import BaseRepository

class ClientRepository(BaseRepository[Client]):
    def __init__(self, db: AsyncSession):
        super().__init__(Client, db)

    async def get_by_tax_id(self, tax_id: str) -> Optional[Client]:
        stmt = select(Client).where(Client.tax_id == tax_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def search_by_name_or_city(self, query: str) -> List[Client]:
        pattern = f"%{query}%"
        stmt = select(Client).where(
            (Client.company_name.ilike(pattern)) | 
            (Client.city.ilike(pattern)) |
            (Client.tax_id.ilike(pattern))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
