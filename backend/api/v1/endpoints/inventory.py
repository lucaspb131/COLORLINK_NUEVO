from fastapi import APIRouter, Depends, Query, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemOut
from repositories.inventory_repo import InventoryRepository

router = APIRouter()

@router.post("/", response_model=InventoryItemOut, status_code=status.HTTP_201_CREATED, summary="Registrar producto en inventario")
async def create_item(item_in: InventoryItemCreate, db: AsyncSession = Depends(get_db)):
    repo = InventoryRepository(db)
    from models.inventory import InventoryItem
    item = InventoryItem(**item_in.model_dump())
    return await repo.create(item)

@router.get("/", response_model=List[InventoryItemOut], summary="Listar catálogo de pinturas y recubrimientos")
async def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    repo = InventoryRepository(db)
    return await repo.get_all(skip=skip, limit=limit)

@router.get("/{item_id}", response_model=InventoryItemOut, summary="Consultar ficha técnica de producto")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = InventoryRepository(db)
    return await repo.get_by_id(item_id)
