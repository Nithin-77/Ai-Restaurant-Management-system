from sqlalchemy.orm import Session
from datetime import datetime

from models import (
    Menu,
    Order,
    Reservation,
    User,
    Customer,
    Inventory,
    Kitchen,
    Settings,
)


# =========================================================
# MENU CRUD
# =========================================================

def get_all_menu(db: Session):
    return db.query(Menu).all()


def create_menu(db: Session, item):
    new_menu = Menu(
        name=item.name,
        category=item.category,
        price=item.price,
        available=item.available
    )

    db.add(new_menu)
    db.commit()
    db.refresh(new_menu)

    return new_menu


def update_menu(db: Session, menu_id: int, item):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu:
        return None

    menu.name = item.name
    menu.category = item.category
    menu.price = item.price
    menu.available = item.available

    db.commit()
    db.refresh(menu)

    return menu


def delete_menu(db: Session, menu_id: int):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu:
        return None

    db.delete(menu)
    db.commit()

    return menu


def toggle_menu_availability(db: Session, menu_id: int):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu:
        return None

    menu.available = not menu.available

    db.commit()
    db.refresh(menu)

    return menu


# =========================================================
# ORDER CRUD
# =========================================================

def get_all_orders(db: Session):
    return db.query(Order).all()


def create_order(db: Session, item):
    # Create customer order
    new_order = Order(
        customer_name=item.customer_name,
        menu_item=item.menu_item,
        quantity=item.quantity,
        total_price=item.total_price,
        status=item.status
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Automatically create kitchen order
    kitchen_order = Kitchen(
        order_id=new_order.id,
        customer_name=new_order.customer_name,
        menu_item=new_order.menu_item,
        quantity=new_order.quantity,
        status="Pending",
        priority="Normal",
        notes=None
    )

    db.add(kitchen_order)
    db.commit()
    db.refresh(kitchen_order)

    return new_order


def update_order(db: Session, order_id: int, item):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        return None

    # Update customer order
    order.customer_name = item.customer_name
    order.menu_item = item.menu_item
    order.quantity = item.quantity
    order.total_price = item.total_price
    order.status = item.status

    # Synchronize corresponding kitchen order
    kitchen_order = (
        db.query(Kitchen)
        .filter(Kitchen.order_id == order.id)
        .first()
    )

    if kitchen_order:
        kitchen_order.customer_name = order.customer_name
        kitchen_order.menu_item = order.menu_item
        kitchen_order.quantity = order.quantity
        kitchen_order.status = order.status

    db.commit()
    db.refresh(order)

    return order


def delete_order(db: Session, order_id: int):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        return None

    db.delete(order)
    db.commit()

    return order


# =========================================================
# RESERVATION CRUD
# =========================================================

def get_all_reservations(db: Session):
    return db.query(Reservation).all()


def create_reservation(db: Session, item):
    new_reservation = Reservation(
        customer_name=item.customer_name,
        table_number=item.table_number,
        reservation_date=item.reservation_date,
        reservation_time=item.reservation_time,
        guests=item.guests
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation


def update_reservation(
    db: Session,
    reservation_id: int,
    item
):
    reservation = (
        db.query(Reservation)
        .filter(Reservation.id == reservation_id)
        .first()
    )

    if not reservation:
        return None

    reservation.customer_name = item.customer_name
    reservation.table_number = item.table_number
    reservation.reservation_date = item.reservation_date
    reservation.reservation_time = item.reservation_time
    reservation.guests = item.guests

    db.commit()
    db.refresh(reservation)

    return reservation


def delete_reservation(
    db: Session,
    reservation_id: int
):
    reservation = (
        db.query(Reservation)
        .filter(Reservation.id == reservation_id)
        .first()
    )

    if not reservation:
        return None

    db.delete(reservation)
    db.commit()

    return reservation


# =========================================================
# CUSTOMER CRUD
# =========================================================

def get_all_customers(db: Session):
    return db.query(Customer).all()


def get_customer(db: Session, customer_id: int):
    return (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )


def create_customer(db: Session, item):
    new_customer = Customer(
        name=item.name,
        email=item.email,
        phone=item.phone,
        address=item.address,
        total_orders=item.total_orders,
        total_spent=item.total_spent,
        created_at=datetime.now()
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def update_customer(
    db: Session,
    customer_id: int,
    item
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        return None

    customer.name = item.name
    customer.email = item.email
    customer.phone = item.phone
    customer.address = item.address
    customer.total_orders = item.total_orders
    customer.total_spent = item.total_spent

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(
    db: Session,
    customer_id: int
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        return None

    db.delete(customer)
    db.commit()

    return customer


# =========================================================
# INVENTORY CRUD
# =========================================================

def get_all_inventory(db: Session):
    return db.query(Inventory).all()


def get_inventory_item(
    db: Session,
    inventory_id: int
):
    return (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )


def create_inventory(db: Session, item):
    new_inventory = Inventory(
        item_name=item.item_name,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        minimum_stock=item.minimum_stock,
        supplier=item.supplier,
        cost_per_unit=item.cost_per_unit,
        created_at=datetime.now()
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


def update_inventory(
    db: Session,
    inventory_id: int,
    item
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )

    if not inventory:
        return None

    inventory.item_name = item.item_name
    inventory.category = item.category
    inventory.quantity = item.quantity
    inventory.unit = item.unit
    inventory.minimum_stock = item.minimum_stock
    inventory.supplier = item.supplier
    inventory.cost_per_unit = item.cost_per_unit

    db.commit()
    db.refresh(inventory)

    return inventory


def delete_inventory(
    db: Session,
    inventory_id: int
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )

    if not inventory:
        return None

    db.delete(inventory)
    db.commit()

    return inventory


# =========================================================
# INVENTORY - LOW STOCK
# =========================================================

def get_low_stock_items(db: Session):
    return (
        db.query(Inventory)
        .filter(
            Inventory.quantity <= Inventory.minimum_stock
        )
        .all()
    )


# =========================================================
# KITCHEN CRUD
# =========================================================

def get_all_kitchen_orders(db: Session):
    return db.query(Kitchen).all()


def get_kitchen_order(
    db: Session,
    kitchen_id: int
):
    return (
        db.query(Kitchen)
        .filter(Kitchen.id == kitchen_id)
        .first()
    )


def create_kitchen_order(db: Session, item):
    new_kitchen_order = Kitchen(
        order_id=item.order_id,
        customer_name=item.customer_name,
        menu_item=item.menu_item,
        quantity=item.quantity,
        status=item.status,
        priority=item.priority,
        notes=item.notes,
        created_at=datetime.now()
    )

    db.add(new_kitchen_order)
    db.commit()
    db.refresh(new_kitchen_order)

    return new_kitchen_order


def update_kitchen_order(
    db: Session,
    kitchen_id: int,
    item
):
    kitchen_order = (
        db.query(Kitchen)
        .filter(Kitchen.id == kitchen_id)
        .first()
    )

    if not kitchen_order:
        return None

    # Update kitchen order
    kitchen_order.status = item.status
    kitchen_order.priority = item.priority
    kitchen_order.notes = item.notes

    # Synchronize with customer order
    if kitchen_order.order_id:
        order = (
            db.query(Order)
            .filter(Order.id == kitchen_order.order_id)
            .first()
        )

        if order:
            order.status = item.status

    db.commit()
    db.refresh(kitchen_order)

    return kitchen_order


def delete_kitchen_order(
    db: Session,
    kitchen_id: int
):
    kitchen_order = (
        db.query(Kitchen)
        .filter(Kitchen.id == kitchen_id)
        .first()
    )

    if not kitchen_order:
        return None

    db.delete(kitchen_order)
    db.commit()

    return kitchen_order


# =========================================================
# KITCHEN - FILTER BY STATUS
# =========================================================

def get_kitchen_orders_by_status(
    db: Session,
    status: str
):
    return (
        db.query(Kitchen)
        .filter(Kitchen.status == status)
        .all()
    )


# =========================================================
# SETTINGS CRUD
# =========================================================

def get_settings(db: Session):
    return db.query(Settings).first()


def create_settings(db: Session, item):
    new_settings = Settings(
        restaurant_name=item.restaurant_name,
        restaurant_address=item.restaurant_address,
        phone=item.phone,
        email=item.email,
        currency=item.currency,
        tax_percentage=item.tax_percentage,
        service_charge_percentage=item.service_charge_percentage,
        opening_time=item.opening_time,
        closing_time=item.closing_time,
        notifications_enabled=item.notifications_enabled,
        ai_enabled=item.ai_enabled
    )

    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)

    return new_settings


def update_settings(
    db: Session,
    settings_id: int,
    item
):
    settings = (
        db.query(Settings)
        .filter(Settings.id == settings_id)
        .first()
    )

    if not settings:
        return None

    if item.restaurant_name is not None:
        settings.restaurant_name = item.restaurant_name

    if item.restaurant_address is not None:
        settings.restaurant_address = item.restaurant_address

    if item.phone is not None:
        settings.phone = item.phone

    if item.email is not None:
        settings.email = item.email

    if item.currency is not None:
        settings.currency = item.currency

    if item.tax_percentage is not None:
        settings.tax_percentage = item.tax_percentage

    if item.service_charge_percentage is not None:
        settings.service_charge_percentage = (
            item.service_charge_percentage
        )

    if item.opening_time is not None:
        settings.opening_time = item.opening_time

    if item.closing_time is not None:
        settings.closing_time = item.closing_time

    if item.notifications_enabled is not None:
        settings.notifications_enabled = (
            item.notifications_enabled
        )

    if item.ai_enabled is not None:
        settings.ai_enabled = item.ai_enabled

    db.commit()
    db.refresh(settings)

    return settings


# =========================================================
# ANALYTICS HELPERS
# =========================================================

def get_total_revenue(db: Session):
    orders = db.query(Order).all()

    total = 0

    for order in orders:
        total += float(order.total_price or 0)

    return total


def get_total_orders(db: Session):
    return db.query(Order).count()


def get_total_customers(db: Session):
    return db.query(Customer).count()


def get_total_reservations(db: Session):
    return db.query(Reservation).count()


def get_total_menu_items(db: Session):
    return db.query(Menu).count()