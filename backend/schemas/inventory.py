from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    sku: str
    name: str
    category: str
    brand: str
    solids_by_volume: float
    theoretical_yield_sqm_gal: float
    drying_time_touch_hours: float
    recoat_time_hours: str
    voc_grams_liter: float
    current_stock_gallons: int = 0
    unit_price_usd: float
    technical_sheet_url: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    solids_by_volume: Optional[float] = None
    theoretical_yield_sqm_gal: Optional[float] = None
    drying_time_touch_hours: Optional[float] = None
    recoat_time_hours: Optional[str] = None
    voc_grams_liter: Optional[float] = None
    current_stock_gallons: Optional[int] = None
    unit_price_usd: Optional[float] = None
    technical_sheet_url: Optional[str] = None

class InventoryItemOut(InventoryItemBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
