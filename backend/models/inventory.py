from sqlalchemy import (
    Column, String, Numeric, Integer, DateTime
)
from datetime import datetime
import uuid
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    brand = Column(String(100), nullable=False)
    solids_by_volume = Column(Numeric(5, 2), nullable=False)
    theoretical_yield_sqm_gal = Column(Numeric(6, 2), nullable=False)
    drying_time_touch_hours = Column(Numeric(4, 2), nullable=False)
    recoat_time_hours = Column(String(50), nullable=False)
    voc_grams_liter = Column(Numeric(6, 2), nullable=False)
    current_stock_gallons = Column(Integer, nullable=False, default=0)
    unit_price_usd = Column(Numeric(10, 2), nullable=False)
    technical_sheet_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
