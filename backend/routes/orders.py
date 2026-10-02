from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db
from crud import (
    get_all_orders,
    create_order,
    update_order,
    delete_order,
)
from schemas import OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])


# GET ALL ORDERS
@router.get("/")
def read_orders(db: Session = Depends(get_db)):
    return get_all_orders(db)


# CREATE ORDER
@router.post("/")
def add_order(item: OrderCreate, db: Session = Depends(get_db)):
    return create_order(db, item)


# UPDATE ORDER
@router.put("/{order_id}")
def edit_order(
    order_id: int,
    item: OrderCreate,
    db: Session = Depends(get_db)
):
    order = update_order(db, order_id, item)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


# DELETE ORDER
@router.delete("/{order_id}")
def remove_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = delete_order(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {"message": "Order deleted successfully"}