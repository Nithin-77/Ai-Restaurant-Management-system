from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    Time,
    DECIMAL,
    Text,
    DateTime,
)

from database import Base


# =========================================================
# MENU
# =========================================================

class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    category = Column(String(50))

    price = Column(DECIMAL(10, 2))

    available = Column(Boolean, default=True)


# =========================================================
# ORDER
# =========================================================

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String(100), nullable=False)

    menu_item = Column(String(100), nullable=False)

    quantity = Column(Integer, nullable=False)

    total_price = Column(Float, nullable=False)

    status = Column(String(50), default="Pending")


# =========================================================
# RESERVATION
# =========================================================

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String(100), nullable=False)

    table_number = Column(Integer, nullable=False)

    reservation_date = Column(Date, nullable=False)

    reservation_time = Column(Time, nullable=False)

    guests = Column(Integer, nullable=False)


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String(255), nullable=False)


# =========================================================
# CUSTOMER
# =========================================================

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    phone = Column(String(20), nullable=False)

    address = Column(String(255))

    total_orders = Column(Integer, default=0)

    total_spent = Column(Float, default=0.0)

    created_at = Column(DateTime)


# =========================================================
# INVENTORY
# =========================================================

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    item_name = Column(String(100), nullable=False)

    category = Column(String(50))

    quantity = Column(Float, nullable=False, default=0)

    unit = Column(String(30))

    minimum_stock = Column(Float, default=0)

    supplier = Column(String(100))

    cost_per_unit = Column(Float, default=0.0)

    created_at = Column(DateTime)


# =========================================================
# KITCHEN / KITCHEN DISPLAY SYSTEM
# =========================================================

class Kitchen(Base):
    __tablename__ = "kitchen"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, nullable=False)

    customer_name = Column(String(100))

    menu_item = Column(String(100), nullable=False)

    quantity = Column(Integer, nullable=False, default=1)

    status = Column(String(50), default="Pending")

    priority = Column(String(30), default="Normal")

    notes = Column(Text)

    created_at = Column(DateTime)


# =========================================================
# SETTINGS
# =========================================================

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_name = Column(
        String(150),
        default="Paradise Restaurant"
    )

    restaurant_address = Column(String(255))

    phone = Column(String(20))

    email = Column(String(100))

    currency = Column(String(10), default="INR")

    tax_percentage = Column(Float, default=5.0)

    service_charge_percentage = Column(Float, default=0.0)

    opening_time = Column(String(20))

    closing_time = Column(String(20))

    notifications_enabled = Column(Boolean, default=True)

    ai_enabled = Column(Boolean, default=True)