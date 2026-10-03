from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.inventory import InventoryItem
from repositories.base import BaseRepository

class InventoryRepository(BaseRepository[InventoryItem]):
    def __init__(self, db: AsyncSession):
        super().__init__(InventoryItem, db)

    async def get_by_sku(self, sku: str) -> Optional[InventoryItem]:
        stmt = select(InventoryItem).where(InventoryItem.sku == sku)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_category(self, category: str) -> List[InventoryItem]:
        stmt = select(InventoryItem).where(InventoryItem.category == category)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
