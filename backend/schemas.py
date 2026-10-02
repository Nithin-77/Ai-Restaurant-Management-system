from pydantic import BaseModel, EmailStr
from datetime import date, time
from typing import Optional



# =========================================================
# MENU SCHEMA
# =========================================================

class MenuCreate(BaseModel):
    name: str
    category: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    available: bool = True


# =========================================================
# ORDER SCHEMA
# =========================================================

class OrderCreate(BaseModel):
    customer_name: str
    menu_item: str
    quantity: int
    total_price: float
    status: str = "Pending"


# =========================================================
# RESERVATION SCHEMA
# =========================================================

class ReservationCreate(BaseModel):
    customer_name: str
    table_number: int
    reservation_date: date
    reservation_time: time
    guests: int


# =========================================================
# USER SCHEMA
# =========================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# =========================================================
# CUSTOMER SCHEMA
# =========================================================

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None

    total_orders: int = 0
    total_spent: float = 0.0


# =========================================================
# INVENTORY SCHEMA
# =========================================================

class InventoryCreate(BaseModel):
    item_name: str

    category: Optional[str] = None

    quantity: float = 0

    unit: Optional[str] = None

    minimum_stock: float = 0

    supplier: Optional[str] = None

    cost_per_unit: float = 0.0


# =========================================================
# KITCHEN SCHEMA
# =========================================================

class KitchenCreate(BaseModel):
    order_id: int

    customer_name: Optional[str] = None

    menu_item: str

    quantity: int = 1

    status: str = "Pending"

    priority: str = "Normal"

    notes: Optional[str] = None


class KitchenUpdate(BaseModel):
    status: Optional[str] = None

    priority: Optional[str] = None

    notes: Optional[str] = None


# =========================================================
# SETTINGS SCHEMA
# =========================================================

class SettingsCreate(BaseModel):
    restaurant_name: str = "Paradise Restaurant"

    restaurant_address: Optional[str] = None

    phone: Optional[str] = None

    email: Optional[EmailStr] = None

    currency: str = "INR"

    tax_percentage: float = 5.0

    service_charge_percentage: float = 0.0

    opening_time: Optional[str] = None

    closing_time: Optional[str] = None

    notifications_enabled: bool = True

    ai_enabled: bool = True


class SettingsUpdate(BaseModel):
    restaurant_name: Optional[str] = None

    restaurant_address: Optional[str] = None

    phone: Optional[str] = None

    email: Optional[EmailStr] = None

    currency: Optional[str] = None

    tax_percentage: Optional[float] = None

    service_charge_percentage: Optional[float] = None

    opening_time: Optional[str] = None

    closing_time: Optional[str] = None

    notifications_enabled: Optional[bool] = None

    ai_enabled: Optional[bool] = None

# =========================================================
# REVIEW SCHEMA
# =========================================================

class ReviewCreate(BaseModel):
    customer_name: str
    menu_item: Optional[str] = None
    rating: int = 5
    comment: str


# =========================================================
# SUPPLIER SCHEMA
# =========================================================

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    category: Optional[str] = None
    address: Optional[str] = None


# =========================================================
# STAFF SCHEMA
# =========================================================

class StaffCreate(BaseModel):
    name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    shift: str = "Morning"
    salary: float = 0.0
    active: bool = True
    joined_on: Optional[date] = None


# =========================================================
# WASTE SCHEMA
# =========================================================

class WasteCreate(BaseModel):
    item_name: str
    quantity: float
    unit: str = "kg"
    reason: Optional[str] = None
    cost: float = 0.0


# =========================================================
# AUTH SCHEMAS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

    user: dict


# =========================================================
# AI REQUEST SCHEMAS
# =========================================================

class SentimentRequest(BaseModel):
    text: str
    
