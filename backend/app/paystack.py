import uuid
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from .config import get_settings
from .database import Property, Purchase, User, utcnow

settings = get_settings()
PAYSTACK_BASE = "https://api.paystack.co"


def amount_to_local_kobo(amount_usd: float) -> int:
    """Paystack expects amount in the smallest currency unit (kobo for NGN)."""
    local = amount_usd * settings.usd_to_local_rate
    return int(round(local * 100))


async def initialize_payment(
    db: Session,
    buyer: User,
    prop: Property,
) -> Purchase:
    if prop.status != "available":
        raise ValueError("This land is no longer available for purchase")
    if prop.listing_type != "sale":
        raise ValueError("Only sale listings can be purchased")
    if not prop.price or prop.price <= 0:
        raise ValueError("Listing has no valid sale price")
    if prop.user_id == buyer.id:
        raise ValueError("You cannot buy your own listing")

    reference = f"LF-{uuid.uuid4().hex[:16].upper()}"
    amount_local = prop.price * settings.usd_to_local_rate
    purchase = Purchase(
        id=str(uuid.uuid4()),
        property_id=prop.property_id,
        buyer_id=buyer.id,
        amount_usd=prop.price,
        amount_local=amount_local,
        currency=settings.currency,
        reference=reference,
        status="pending",
    )

    if settings.paystack_enabled:
        amount_kobo = amount_to_local_kobo(prop.price)
        payload = {
            "email": buyer.email,
            "amount": amount_kobo,
            "currency": settings.currency,
            "reference": reference,
            "callback_url": f"{settings.frontend_url}/checkout/success?reference={reference}",
            "metadata": {
                "property_id": prop.property_id,
                "buyer_id": buyer.id,
                "title": prop.title,
            },
        }
        headers = {
            "Authorization": f"Bearer {settings.paystack_secret_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{PAYSTACK_BASE}/transaction/initialize", json=payload, headers=headers)
            data = resp.json()
            if resp.status_code >= 400 or not data.get("status"):
                message = data.get("message") or "Paystack initialization failed"
                raise ValueError(message)
            purchase.authorization_url = data["data"]["authorization_url"]
            purchase.paystack_access_code = data["data"].get("access_code")
    else:
        # Local mock checkout — no real Paystack keys required for demo/testing
        purchase.authorization_url = (
            f"{settings.frontend_url}/checkout/mock?reference={reference}"
        )

    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


async def verify_payment(db: Session, reference: str, current_user: Optional[User] = None) -> Purchase:
    purchase = db.query(Purchase).filter(Purchase.reference == reference).first()
    if not purchase:
        raise ValueError("Payment not found")

    if current_user and purchase.buyer_id != current_user.id and current_user.account_type != "agent":
        # Allow buyer to verify their own payment
        if purchase.buyer_id != current_user.id:
            raise ValueError("Not authorized to verify this payment")

    if purchase.status == "success":
        return purchase

    prop = db.query(Property).filter(Property.property_id == purchase.property_id).first()
    if not prop:
        raise ValueError("Property not found")

    paid = False
    if settings.paystack_enabled:
        headers = {"Authorization": f"Bearer {settings.paystack_secret_key}"}
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{PAYSTACK_BASE}/transaction/verify/{reference}", headers=headers)
            data = resp.json()
            if resp.status_code >= 400 or not data.get("status"):
                raise ValueError(data.get("message") or "Paystack verification failed")
            paid = data["data"].get("status") == "success"
    else:
        # Mock mode: completing checkout marks payment successful
        paid = True

    if not paid:
        purchase.status = "failed"
        db.commit()
        db.refresh(purchase)
        raise ValueError("Payment was not successful")

    if prop.status == "sold":
        # Another buyer may have completed first
        purchase.status = "failed"
        db.commit()
        raise ValueError("This land was already sold")

    purchase.status = "success"
    purchase.paid_at = utcnow()
    prop.status = "sold"
    prop.updated_at = utcnow()
    db.commit()
    db.refresh(purchase)
    return purchase
