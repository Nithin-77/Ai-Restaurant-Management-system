from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from crud import get_all_users, create_user
from schemas import UserCreate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def read_users(db: Session = Depends(get_db)):
    return get_all_users(db)


@router.post("/")
def add_user(
    item: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, item)