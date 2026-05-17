"""India-specific localization utilities for the application."""

from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
import re


class Locale(str, Enum):
    """Supported locales."""
    EN = "en"  # English
    HI = "hi"  # Hindi
    TA = "ta"  # Tamil
    TE = "te"  # Telugu


class Currency(str, Enum):
    """Supported currencies."""
    INR = "INR"  # Indian Rupee
    USD = "USD"  # US Dollar


# Locale-specific configurations
LOCALE_CONFIG = {
    "en": {
        "name": "English",
        "currency": "INR",
        "date_format": "dd/MM/yyyy",  # Indian format
        "time_format": "HH:mm",
        "timezone": "Asia/Kolkata",
        "decimal_separator": ".",
        "thousands_separator": ",",
        "phone_format": "+91-XXXXX-XXXXX",
    },
    "hi": {
        "name": "हिंदी (Hindi)",
        "currency": "INR",
        "date_format": "dd/MM/yyyy",
        "time_format": "HH:mm",
        "timezone": "Asia/Kolkata",
        "decimal_separator": ".",
        "thousands_separator": ",",
        "phone_format": "+91-XXXXX-XXXXX",
    },
    "ta": {
        "name": "தமிழ் (Tamil)",
        "currency": "INR",
        "date_format": "dd/MM/yyyy",
        "time_format": "HH:mm",
        "timezone": "Asia/Kolkata",
        "decimal_separator": ".",
        "thousands_separator": ",",
        "phone_format": "+91-XXXXX-XXXXX",
    },
    "te": {
        "name": "తెలుగు (Telugu)",
        "currency": "INR",
        "date_format": "dd/MM/yyyy",
        "time_format": "HH:mm",
        "timezone": "Asia/Kolkata",
        "decimal_separator": ".",
        "thousands_separator": ",",
        "phone_format": "+91-XXXXX-XXXXX",
    },
}


class CurrencyFormatter:
    """Format amounts in India-specific currency formats."""

    CURRENCY_SYMBOLS = {
        "INR": "₹",
        "USD": "$",
    }

    CURRENCY_POSITIONS = {
        "INR": "prefix",  # ₹500
        "USD": "prefix",  # $500
    }

    @staticmethod
    def format_amount(
        amount: float,
        currency: str = "INR",
        include_symbol: bool = True,
    ) -> str:
        """
        Format amount with currency symbol using Indian numbering system.

        India uses lakhs and crores for large numbers:
        - 1,00,000 (one lakh)
        - 10,00,000 (ten lakhs)
        - 1,00,00,000 (one crore)

        Args:
            amount: Amount to format
            currency: Currency code (INR, USD)
            include_symbol: Include currency symbol

        Returns:
            Formatted amount string (e.g., "₹5,00,000" or "₹12,34,567")
        """
        symbol = CurrencyFormatter.CURRENCY_SYMBOLS.get(currency, currency)
        position = CurrencyFormatter.CURRENCY_POSITIONS.get(currency, "prefix")

        # Format with Indian numbering system
        formatted_amount = CurrencyFormatter._indian_format(amount)

        if not include_symbol:
            return formatted_amount

        if position == "prefix":
            return f"{symbol}{formatted_amount}"
        else:
            return f"{formatted_amount} {symbol}"

    @staticmethod
    def _indian_format(amount: float) -> str:
        """Format number using Indian numbering system (1,00,000 format)."""
        # Convert to string with 2 decimal places
        amount_str = f"{amount:,.2f}"

        # Remove commas first
        parts = amount_str.split(",")
        amount_no_comma = "".join(parts)

        # Split into integer and decimal parts
        if "." in amount_no_comma:
            integer_part, decimal_part = amount_no_comma.split(".")
        else:
            integer_part = amount_no_comma
            decimal_part = "00"

        # Apply Indian numbering system to integer part
        integer_part = integer_part.zfill(1)

        # Indian format: reverse add commas from right, every 2 digits after first 3
        if len(integer_part) <= 3:
            formatted_integer = integer_part
        else:
            # First 3 digits from right (ones, tens, hundreds)
            last_three = integer_part[-3:]
            remaining = integer_part[:-3]

            # Add commas every 2 digits for the remaining part
            formatted_remaining = ""
            for i, digit in enumerate(reversed(remaining)):
                if i > 0 and i % 2 == 0:
                    formatted_remaining = "," + formatted_remaining
                formatted_remaining = digit + formatted_remaining

            formatted_integer = formatted_remaining + "," + last_three

        return f"{formatted_integer}.{decimal_part}"

    @staticmethod
    def parse_amount(formatted_str: str, currency: str = "INR") -> Optional[float]:
        """
        Parse formatted currency string back to float.

        Args:
            formatted_str: Formatted string (e.g., "₹5,00,000.50")
            currency: Currency code

        Returns:
            Float amount or None if parsing fails
        """
        try:
            # Remove currency symbol
            symbol = CurrencyFormatter.CURRENCY_SYMBOLS.get(currency, currency)
            cleaned = formatted_str.replace(symbol, "").strip()

            # Remove commas
            cleaned = cleaned.replace(",", "")

            # Convert to float
            return float(cleaned)
        except (ValueError, AttributeError):
            return None


class PhoneFormatter:
    """Format and validate Indian phone numbers."""

    INDIA_COUNTRY_CODE = "+91"
    INDIA_CODE_LENGTH = 10  # Indian phone numbers are 10 digits

    @staticmethod
    def format_phone(phone: str) -> str:
        """
        Format phone number in Indian format.

        Args:
            phone: Phone number (with or without country code)

        Returns:
            Formatted phone number (e.g., "+91-98765-43210")
        """
        # Remove all non-digit characters
        digits = re.sub(r"\D", "", phone)

        # If already includes country code (91), remove it
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        # If starts with 91 but different length, keep as is
        elif len(digits) > 10:
            if not digits.startswith("91"):
                digits = digits[-10:]  # Take last 10 digits

        # Ensure we have exactly 10 digits
        if len(digits) != 10:
            return phone  # Return original if can't format

        # Format as +91-XXXXX-XXXXX
        return f"{PhoneFormatter.INDIA_COUNTRY_CODE}-{digits[:5]}-{digits[5:]}"

    @staticmethod
    def is_valid_phone(phone: str) -> bool:
        """
        Validate Indian phone number.

        Args:
            phone: Phone number to validate

        Returns:
            True if valid Indian phone number
        """
        digits = re.sub(r"\D", "", phone)

        # Remove country code if present
        if digits.startswith("91"):
            digits = digits[2:]

        # Must be exactly 10 digits
        if len(digits) != 10:
            return False

        # First digit should be 6-9 (valid for Indian mobile)
        if digits[0] not in "6789":
            return False

        return True

    @staticmethod
    def format_for_api(phone: str) -> str:
        """
        Format phone number for API calls (with country code, no formatting).

        Args:
            phone: Phone number in any format

        Returns:
            Phone number with country code (e.g., "919876543210")
        """
        digits = re.sub(r"\D", "", phone)

        # Remove existing country code if present
        if digits.startswith("91"):
            if len(digits) == 12:
                return digits
            elif len(digits) > 12:
                digits = digits[-10:]  # Take last 10 digits

        # Add country code
        return "91" + digits[-10:]


class DateFormatter:
    """Format dates in India-specific formats."""

    MONTH_NAMES_EN = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    MONTH_NAMES_HI = [
        "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
        "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
    ]

    @staticmethod
    def format_date(date: datetime, locale: str = "en") -> str:
        """
        Format date in India-specific format (DD/MM/YYYY).

        Args:
            date: DateTime object
            locale: Locale code (en, hi)

        Returns:
            Formatted date string
        """
        day = date.strftime("%d")
        month = str(int(date.strftime("%m")))
        year = date.strftime("%Y")

        return f"{day}/{month}/{year}"

    @staticmethod
    def format_long_date(date: datetime, locale: str = "en") -> str:
        """
        Format date with month name (e.g., "15 January 2026" or "15 जनवरी 2026").

        Args:
            date: DateTime object
            locale: Locale code

        Returns:
            Long formatted date string
        """
        day = date.strftime("%d").lstrip("0")  # Remove leading zero
        month_idx = int(date.strftime("%m")) - 1
        year = date.strftime("%Y")

        if locale == "hi":
            month_name = DateFormatter.MONTH_NAMES_HI[month_idx]
        else:
            month_name = DateFormatter.MONTH_NAMES_EN[month_idx]

        return f"{day} {month_name} {year}"

    @staticmethod
    def format_time(date: datetime) -> str:
        """
        Format time in 24-hour format (HH:MM).

        Args:
            date: DateTime object

        Returns:
            Formatted time string
        """
        return date.strftime("%H:%M")


class GSTFormatter:
    """Format and validate GST (Goods and Services Tax) for India."""

    GST_RATE_STANDARD = 18  # Standard GST rate
    GST_RATE_REDUCED = 5    # Reduced rate for essentials
    GST_RATE_ZERO = 0       # Zero-rated for exempted items

    @staticmethod
    def calculate_gst(amount: float, gst_rate: int = 18) -> float:
        """
        Calculate GST amount.

        Args:
            amount: Amount before GST
            gst_rate: GST rate percentage (default: 18%)

        Returns:
            GST amount
        """
        return round(amount * (gst_rate / 100), 2)

    @staticmethod
    def calculate_total_with_gst(amount: float, gst_rate: int = 18) -> float:
        """
        Calculate total amount including GST.

        Args:
            amount: Amount before GST
            gst_rate: GST rate percentage

        Returns:
            Total amount including GST
        """
        gst = GSTFormatter.calculate_gst(amount, gst_rate)
        return round(amount + gst, 2)

    @staticmethod
    def calculate_amount_from_total(total: float, gst_rate: int = 18) -> tuple:
        """
        Calculate original amount from total (including GST).

        Args:
            total: Total amount including GST
            gst_rate: GST rate percentage

        Returns:
            Tuple (original_amount, gst_amount)
        """
        original = round(total / (1 + gst_rate / 100), 2)
        gst = round(total - original, 2)
        return (original, gst)

    @staticmethod
    def format_gst_breakdown(amount: float, gst_rate: int = 18) -> Dict[str, float]:
        """
        Get GST breakdown information.

        Args:
            amount: Amount before GST
            gst_rate: GST rate percentage

        Returns:
            Dictionary with breakdown
        """
        gst_amount = GSTFormatter.calculate_gst(amount, gst_rate)
        total = GSTFormatter.calculate_total_with_gst(amount, gst_rate)

        return {
            "subtotal": amount,
            "gst_rate": gst_rate,
            "gst_amount": gst_amount,
            "total": total,
        }


# Convenience functions
def format_currency(amount: float, currency: str = "INR") -> str:
    """Format amount as currency."""
    return CurrencyFormatter.format_amount(amount, currency)


def format_phone(phone: str) -> str:
    """Format phone number."""
    return PhoneFormatter.format_phone(phone)


def is_valid_phone(phone: str) -> bool:
    """Validate phone number."""
    return PhoneFormatter.is_valid_phone(phone)


def format_date(date: datetime, locale: str = "en") -> str:
    """Format date."""
    return DateFormatter.format_date(date, locale)


def calculate_gst(amount: float, rate: int = 18) -> float:
    """Calculate GST on amount."""
    return GSTFormatter.calculate_gst(amount, rate)


def calculate_total_with_gst(amount: float, rate: int = 18) -> float:
    """Calculate total with GST."""
    return GSTFormatter.calculate_total_with_gst(amount, rate)
