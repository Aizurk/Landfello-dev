import uuid
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, verify_password
from .config import get_settings
from .database import Property, Purchase, User, get_db, init_db, utcnow
from .paystack import initialize_payment, verify_payment
from .schemas import (
    AuthResponse,
    LoginRequest,
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentVerifyResponse,
    PropertyIn,
    PropertyOut,
    PurchaseOut,
    SignupRequest,
    UserOut,
    property_to_out,
    user_to_out,
)
from .seed import seed_demo_data

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = next(get_db())
    try:
        seed_demo_data(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "paystack": "enabled" if settings.paystack_enabled else "mock",
        "currency": settings.currency,
    }


@app.get("/api")
def api_root():
    return {"message": "Welcome to Landfello API", "status": "running"}


@app.post("/api/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.accountType == "agent" and not payload.licenseNumber:
        raise HTTPException(status_code=400, detail="License number is required for agents")

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        account_type=payload.accountType,
        first_name=payload.firstName,
        last_name=payload.lastName,
        phone_number=payload.phoneNumber,
        license_number=payload.licenseNumber if payload.accountType == "agent" else None,
        company_name=payload.companyName if payload.accountType == "agent" else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, {"accountType": user.account_type, "email": user.email})
    return AuthResponse(token=token, user=user_to_out(user))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, {"accountType": user.account_type, "email": user.email})
    return AuthResponse(token=token, user=user_to_out(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user_to_out(user)


@app.get("/api/properties", response_model=list[PropertyOut])
def list_properties(
    country: Optional[str] = None,
    propertyType: Optional[str] = None,
    listingType: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    status: Optional[str] = Query(default="available"),
    db: Session = Depends(get_db),
):
    q = db.query(Property)
    if status:
        q = q.filter(Property.status == status)
    if country:
        q = q.filter(Property.country.ilike(country))
    if propertyType:
        q = q.filter(Property.property_type == propertyType)
    if listingType:
        q = q.filter(Property.listing_type == listingType)
    if minPrice is not None:
        q = q.filter(Property.price >= minPrice)
    if maxPrice is not None:
        q = q.filter(Property.price <= maxPrice)

    props = q.order_by(Property.created_at.desc()).all()
    results = []
    for prop in props:
        agent = db.query(User).filter(User.id == prop.user_id).first()
        results.append(property_to_out(prop, agent))
    return results


@app.post("/api/properties", response_model=PropertyOut, status_code=201)
def create_property(
    payload: PropertyIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.account_type != "agent":
        raise HTTPException(status_code=403, detail="Only agents can list land for sale")
    if payload.listingType == "sale" and (payload.price is None or payload.price <= 0):
        raise HTTPException(status_code=400, detail="Sale listings require a valid price")

    prop = Property(
        property_id=str(uuid.uuid4()),
        user_id=user.id,
        listing_type=payload.listingType,
        title=payload.title,
        description=payload.description,
        country=payload.country,
        city=payload.city,
        neighborhood=payload.neighborhood,
        property_type=payload.propertyType,
        area_acres=payload.areaAcres,
        tenure=payload.tenure,
        lease_term=payload.leaseTerm,
        price=payload.price,
        monthly_rent=payload.monthlyRent,
        tags=payload.tags or [],
        images=payload.images or [],
        contact_name=payload.contactName,
        contact_phone=payload.contactPhone,
        contact_email=str(payload.contactEmail),
        verified=True if payload.verified is None else payload.verified,
        days_on_market=payload.daysOnMarket or 0,
        status="available",
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return property_to_out(prop, user)


@app.get("/api/properties/user/{user_id}", response_model=list[PropertyOut])
def user_properties(
    user_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this resource")
    props = db.query(Property).filter(Property.user_id == user_id).order_by(Property.created_at.desc()).all()
    return [property_to_out(p, user) for p in props]


@app.get("/api/properties/{property_id}", response_model=PropertyOut)
def get_property(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    agent = db.query(User).filter(User.id == prop.user_id).first()
    return property_to_out(prop, agent)


@app.put("/api/properties/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: str,
    payload: PropertyIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.user_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this property")

    prop.listing_type = payload.listingType
    prop.title = payload.title
    prop.description = payload.description
    prop.country = payload.country
    prop.city = payload.city
    prop.neighborhood = payload.neighborhood
    prop.property_type = payload.propertyType
    prop.area_acres = payload.areaAcres
    prop.tenure = payload.tenure
    prop.lease_term = payload.leaseTerm
    prop.price = payload.price
    prop.monthly_rent = payload.monthlyRent
    prop.tags = payload.tags or []
    prop.images = payload.images or []
    prop.contact_name = payload.contactName
    prop.contact_phone = payload.contactPhone
    prop.contact_email = str(payload.contactEmail)
    prop.updated_at = utcnow()
    db.commit()
    db.refresh(prop)
    return property_to_out(prop, user)


@app.delete("/api/properties/{property_id}", status_code=204)
def delete_property(
    property_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.user_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this property")
    db.delete(prop)
    db.commit()
    return None


@app.post("/api/payments/initialize", response_model=PaymentInitResponse)
async def payments_initialize(
    payload: PaymentInitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.property_id == payload.propertyId).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    try:
        purchase = await initialize_payment(db, user, prop)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return PaymentInitResponse(
        reference=purchase.reference,
        authorizationUrl=purchase.authorization_url or "",
        accessCode=purchase.paystack_access_code,
        publicKey=settings.paystack_public_key or None,
        amountLocal=purchase.amount_local,
        currency=purchase.currency,
        email=user.email,
        mock=not settings.paystack_enabled,
    )


@app.get("/api/payments/verify/{reference}", response_model=PaymentVerifyResponse)
async def payments_verify(
    reference: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        purchase = await verify_payment(db, reference, user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return PaymentVerifyResponse(
        status=purchase.status,
        reference=purchase.reference,
        propertyId=purchase.property_id,
        amountUsd=purchase.amount_usd,
        message="Payment successful. Land purchase completed."
        if purchase.status == "success"
        else "Payment pending or failed",
    )


@app.get("/api/purchases/me", response_model=list[PurchaseOut])
def my_purchases(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Purchase)
        .filter(Purchase.buyer_id == user.id, Purchase.status == "success")
        .order_by(Purchase.paid_at.desc())
        .all()
    )
    out = []
    for p in rows:
        prop = db.query(Property).filter(Property.property_id == p.property_id).first()
        out.append(
            PurchaseOut(
                id=p.id,
                propertyId=p.property_id,
                propertyTitle=prop.title if prop else "Unknown land",
                amountUsd=p.amount_usd,
                amountLocal=p.amount_local,
                currency=p.currency,
                reference=p.reference,
                status=p.status,
                paidAt=p.paid_at,
                createdAt=p.created_at,
            )
        )
    return out
