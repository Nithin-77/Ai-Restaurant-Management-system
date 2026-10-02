from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import RegisterRequest, LoginRequest, Token
from utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user_in_db(db: Session, name: str, email: str, password: str, role: str = "customer"):
    hashed_password = get_password_hash(password)
    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, data.email)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # All self-registrations create customer accounts
    role = "customer"

    user = create_user_in_db(db, data.name, data.email, data.password, role)

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    })

    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        "token": access_token,
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    })

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        "token": access_token,
    }