"""
Centralized restaurant timezone handling.

The restaurant operates in India (Asia/Kolkata / IST).
All "today" calculations must use this timezone to ensure consistency
between admin dashboard, customer portal, and AI analytics.
"""

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

RESTAURANT_TIMEZONE = ZoneInfo("Asia/Kolkata")


def restaurant_now() -> datetime:
    """
    Current datetime in the restaurant's timezone (IST).
    """
    return datetime.now(RESTAURANT_TIMEZONE)


def restaurant_today() -> date:
    """
    Current date in the restaurant's timezone (IST).

    Use this instead of date.today() for all "today" calculations.
    """
    return restaurant_now().date()


def restaurant_yesterday() -> date:
    """
    Yesterday's date in the restaurant's timezone (IST).
    """
    return restaurant_today() - timedelta(days=1)


def start_of_restaurant_day(d: date | None = None) -> datetime:
    """
    Start of day (00:00:00) in restaurant timezone for a given date.
    """
    if d is None:
        d = restaurant_today()
    return datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=RESTAURANT_TIMEZONE)


def end_of_restaurant_day(d: date | None = None) -> datetime:
    """
    End of day (23:59:59.999999) in restaurant timezone for a given date.
    """
    if d is None:
        d = restaurant_today()
    return datetime(d.year, d.month, d.day, 23, 59, 59, 999999, tzinfo=RESTAURANT_TIMEZONE)