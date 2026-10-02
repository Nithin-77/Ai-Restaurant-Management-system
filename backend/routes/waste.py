from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db
from models import Waste, Order
from schemas import WasteCreate
from ml.waste import analyze_waste

router = APIRouter(prefix="/waste", tags=["Food Waste"])


@router.get("/")
def read_waste(db: Session = Depends(get_db)):
    return db.query(Waste).order_by(Waste.id.desc()).all()


@router.post("/")
def add_waste(item: WasteCreate, db: Session = Depends(get_db)):
    record = Waste(**item.model_dump())

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.get("/analysis")
def waste_analysis(db: Session = Depends(get_db)):
    """ML-backed waste patterns, next-week prediction and actions."""
    return analyze_waste(
        db.query(Waste).all(),
        db.query(Order).all(),
    )


@router.delete("/{waste_id}")
def remove_waste(waste_id: int, db: Session = Depends(get_db)):
    record = db.query(Waste).filter(Waste.id == waste_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(record)
    db.commit()

    return {"message": "Waste record deleted successfully"}