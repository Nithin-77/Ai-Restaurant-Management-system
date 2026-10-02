from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db

from crud import (
    get_all_inventory,
    get_inventory_item,
    create_inventory,
    update_inventory,
    delete_inventory,
    get_low_stock_items,
)

from schemas import InventoryCreate


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


# =========================================================
# GET ALL INVENTORY
# =========================================================

@router.get("/")
def read_inventory(
    db: Session = Depends(get_db)
):
    return get_all_inventory(db)


# =========================================================
# GET LOW STOCK ITEMS
# =========================================================

@router.get("/low-stock")
def read_low_stock(
    db: Session = Depends(get_db)
):
    return get_low_stock_items(db)


# =========================================================
# GET INVENTORY ITEM
# =========================================================

@router.get("/{inventory_id}")
def read_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    item = get_inventory_item(
        db,
        inventory_id
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    return item


# =========================================================
# CREATE INVENTORY ITEM
# =========================================================

@router.post("/")
def add_inventory(
    item: InventoryCreate,
    db: Session = Depends(get_db)
):
    return create_inventory(db, item)


# =========================================================
# UPDATE INVENTORY ITEM
# =========================================================

@router.put("/{inventory_id}")
def edit_inventory(
    inventory_id: int,
    item: InventoryCreate,
    db: Session = Depends(get_db)
):
    inventory = update_inventory(
        db,
        inventory_id,
        item
    )

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    return inventory


# =========================================================
# DELETE INVENTORY ITEM
# =========================================================

@router.delete("/{inventory_id}")
def remove_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    inventory = delete_inventory(
        db,
        inventory_id
    )

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )

    return {
        "message": "Inventory item deleted successfully"
    }