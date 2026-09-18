from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Menu
from schemas import MenuCreate

router = APIRouter(
    prefix="/menu",
    tags=["Menu"]
)


# GET all menu items
@router.get("/")
def get_menu(db: Session = Depends(get_db)):
    return db.query(Menu).all()


# ADD menu item
@router.post("/")
def add_menu(
    item: MenuCreate,
    db: Session = Depends(get_db)
):
    new_item = Menu(
        name=item.name,
        category=item.category,
        price=item.price,
        available=True
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# UPDATE menu item
@router.put("/{item_id}")
def update_menu(
    item_id: int,
    item: MenuCreate,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(
        Menu.id == item_id
    ).first()

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    menu_item.name = item.name
    menu_item.category = item.category
    menu_item.price = item.price

    db.commit()
    db.refresh(menu_item)

    return menu_item


# DELETE menu item
@router.delete("/{item_id}")
def delete_menu(
    item_id: int,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(
        Menu.id == item_id
    ).first()

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(menu_item)
    db.commit()

    return {
        "message": "Menu item deleted successfully"
    }


# CHANGE AVAILABILITY
@router.patch("/{item_id}/availability")
def toggle_availability(
    item_id: int,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(
        Menu.id == item_id
    ).first()

    if not menu_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    menu_item.available = not menu_item.available

    db.commit()
    db.refresh(menu_item)

    return menu_item