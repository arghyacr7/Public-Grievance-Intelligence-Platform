import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests

from ..database import get_db
from ..models import User, RoleEnum, Complaint, StatusEnum
from ..schemas import UserResponse, Token, GoogleLoginRequest, UserRegister
from ..auth_utils import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user, get_password_hash, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/google", response_model=Token)
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not configured on server.")

    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(req.credential, requests.Request(), client_id)
        email = idinfo.get('email')
        name = idinfo.get('name', 'Google User')
        
        if not email:
            raise ValueError("Token missing email")

        # Find user by email
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            # Create new citizen user without a password
            user = User(
                name=name,
                email=email,
                hashed_password=None,
                auth_provider='google',
                role=RoleEnum.citizen
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Generate JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        # Invalid token
        print(f"Google Token Verification Failed: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token. Error: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/me/stats")
async def get_my_stats(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Return officer performance stats from the complaints table."""
    # Total complaints in the system (for officers) or user's own complaints (for citizens)
    if current_user.role == RoleEnum.officer:
        # Officers see all non-deleted complaints as their workload
        total_stmt = select(func.count(Complaint.id)).where(Complaint.is_deleted == False)
        resolved_stmt = select(func.count(Complaint.id)).where(
            Complaint.is_deleted == False,
            Complaint.status == StatusEnum.resolved
        )
        active_stmt = select(func.count(Complaint.id)).where(
            Complaint.is_deleted == False,
            Complaint.status != StatusEnum.resolved
        )
        # Recent complaints for notifications
        recent_stmt = (
            select(Complaint)
            .where(Complaint.is_deleted == False)
            .order_by(Complaint.created_at.desc())
            .limit(5)
        )
    else:
        # Citizens see their own stats
        total_stmt = select(func.count(Complaint.id)).where(
            Complaint.user_id == current_user.id,
            Complaint.is_deleted == False
        )
        resolved_stmt = select(func.count(Complaint.id)).where(
            Complaint.user_id == current_user.id,
            Complaint.is_deleted == False,
            Complaint.status == StatusEnum.resolved
        )
        active_stmt = select(func.count(Complaint.id)).where(
            Complaint.user_id == current_user.id,
            Complaint.is_deleted == False,
            Complaint.status != StatusEnum.resolved
        )
        recent_stmt = (
            select(Complaint)
            .where(Complaint.user_id == current_user.id, Complaint.is_deleted == False)
            .order_by(Complaint.created_at.desc())
            .limit(5)
        )

    total_result = await db.execute(total_stmt)
    total = total_result.scalar() or 0

    resolved_result = await db.execute(resolved_stmt)
    resolved = resolved_result.scalar() or 0

    active_result = await db.execute(active_stmt)
    active = active_result.scalar() or 0

    resolution_rate = round((resolved / total) * 100) if total > 0 else 0

    recent_result = await db.execute(recent_stmt)
    recent_complaints = recent_result.scalars().all()

    notifications = []
    for c in recent_complaints:
        severity = c.severity.value if c.severity else "Low"
        icon_map = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🟢"}
        icon = icon_map.get(severity, "🔵")
        
        if c.status == StatusEnum.resolved:
            text = f"Complaint #{c.id} marked resolved"
            icon = "🟢"
        elif c.is_duplicate:
            text = f"Duplicate complaint #{c.id} detected"
            icon = "🔵"
        elif severity == "Critical":
            text = f"Critical issue #{c.id}: {c.title[:40]}"
        else:
            text = f"New complaint #{c.id}: {c.title[:40]}"
        
        notifications.append({
            "id": c.id,
            "text": text,
            "icon": icon,
            "time": c.created_at.isoformat() if c.created_at else None,
            "severity": severity,
        })

    return {
        "total": total,
        "active": active,
        "resolved": resolved,
        "resolution_rate": resolution_rate,
        "notifications": notifications,
    }

@router.post("/register", response_model=Token)
async def register_user(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        auth_provider='local',
        role=RoleEnum.citizen
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
