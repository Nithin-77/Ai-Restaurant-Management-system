from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

try:
    from database import get_db
except (ImportError, ValueError):
    from ..database import get_db
from models import Review
from schemas import ReviewCreate
from ml.sentiment import analyze_sentiment, summarize_reviews

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews & Feedback"],
)


@router.get("/")
def read_reviews(db: Session = Depends(get_db)):
    return db.query(Review).order_by(Review.id.desc()).all()


@router.post("/")
def add_review(item: ReviewCreate, db: Session = Depends(get_db)):
    """Every new review is classified by the NLP model on the way in."""
    result = analyze_sentiment(item.comment)

    review = Review(
        customer_name=item.customer_name,
        menu_item=item.menu_item,
        rating=item.rating,
        comment=item.comment,
        sentiment=result["sentiment"],
        sentiment_score=result["score"],
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get("/summary")
def review_summary(db: Session = Depends(get_db)):
    """Aggregated sentiment for the admin dashboard."""
    return summarize_reviews(db.query(Review).all())


@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully"}