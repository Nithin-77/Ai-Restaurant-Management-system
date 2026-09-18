from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

from routes.menu import router as menu_router
from routes.orders import router as orders_router
from routes.reservation import router as reservation_router

from routes.customers import router as customers_router
from routes.inventory import router as inventory_router
from routes.kitchen import router as kitchen_router
from routes.analytics import router as analytics_router
from routes.ai import router as ai_router
from routes.settings import router as settings_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Restaurant Management System",
    description="AI-powered restaurant management backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing routes
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(reservation_router)


# New routes
app.include_router(customers_router)
app.include_router(inventory_router)
app.include_router(kitchen_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(settings_router)


@app.get("/")
def root():
    return {
        "message": "AI Restaurant Management System API is running"
    }