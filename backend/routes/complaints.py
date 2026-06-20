import io
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import List, Optional
from PIL import Image, UnidentifiedImageError

from ..database import get_db
from ..models import Complaint, DetectionResult, User, RoleEnum
from ..schemas import ComplaintResponse, ComplaintUpdateStatus
from ..auth_utils import get_current_active_user, get_current_user

from ..ai.detector import detect_issues
from ..ai.severity import predict_severity
from ..ai.duplicate import calculate_phash, is_duplicate, haversine
from ..ai.llm import summarize_narrative, generate_blueprint, generate_title_description
from ..ai.captioning import generate_caption
from ..email_utils import send_status_update_email

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Maps YOLO class names → civic categories
DETECTION_CATEGORY_MAP = {
    "pothole":      "Pothole",
    "garbage":      "Garbage",
    "trash":        "Garbage",
    "waste":        "Garbage",
    "litter":       "Garbage",
    "streetlight":  "Streetlight",
    "light":        "Streetlight",
    "water":        "Waterlogging",
    "flood":        "Waterlogging",
    "waterlogging": "Waterlogging",
}

def infer_category(detections: list) -> str:
    """Infer the civic category from YOLO detections."""
    for d in detections:
        name_lower = d["class_name"].lower()
        for keyword, cat in DETECTION_CATEGORY_MAP.items():
            if keyword in name_lower:
                return cat
    return "General"


@router.post("/analyze")
async def analyze_image(
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pre-submit analysis: runs AI pipeline and returns results without saving."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    # AI 1: Object Detection
    raw_detections = detect_issues(image)

    # AI 2: BLIP Captioning
    image_caption = generate_caption(image)
    
    # --- FALSE POSITIVE FILTER ---
    caption_lower = image_caption.lower()
    is_garbage = any(kw in caption_lower for kw in ['trash', 'garbage', 'litter', 'waste', 'cardboard', 'plastic', 'bottles', 'box', 'debris', 'dump', 'rubbish', 'scrap'])
    filtered_detections = []
    for d in raw_detections:
        cls_name = d["class_name"].lower()
        if "garbage" in cls_name:
            if is_garbage:
                filtered_detections.append(d)
        else:
            filtered_detections.append(d)
            
    detections = filtered_detections

    # AI 3: Auto-infer category
    category = infer_category(detections)

    # AI 4: Severity Prediction
    severity, severity_score = predict_severity(detections, category)

    # AI 5: Auto-generate title & description via Gemini
    title_desc = generate_title_description(detections, image_caption, category)

    # AI 6: Duplicate Check (location-based, 100m radius)
    stmt = select(Complaint).where(Complaint.category == category)
    result = await db.execute(stmt)
    existing_complaints = result.scalars().all()

    is_dup = False
    duplicate_of_id = None
    for complaint in existing_complaints:
        if complaint.latitude and complaint.longitude:
            dist = haversine(longitude, latitude, complaint.longitude, complaint.latitude)
            if dist < 100:
                is_dup = True
                duplicate_of_id = complaint.id
                break

    # AI 7: Generate summary
    ai_summary = summarize_narrative(title_desc["description"], detections, image_caption)

    return {
        "title": title_desc["title"],
        "description": title_desc["description"],
        "category": category,
        "severity": severity.value,
        "severity_score": severity_score,
        "detections": detections,
        "image_caption": image_caption,
        "ai_summary": ai_summary,
        "is_duplicate": is_dup,
        "duplicate_of": duplicate_of_id,
    }


@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # Allow any authenticated user
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file.")
        
    # AI 1: Object Detection
    raw_detections = detect_issues(image)

    # AI 2: Generative Assistance
    image_caption = generate_caption(image)
    
    # --- FALSE POSITIVE FILTER ---
    caption_lower = image_caption.lower()
    is_garbage = any(kw in caption_lower for kw in ['trash', 'garbage', 'litter', 'waste', 'cardboard', 'plastic', 'bottles', 'box', 'debris', 'dump', 'rubbish', 'scrap'])
    filtered_detections = []
    for d in raw_detections:
        cls_name = d["class_name"].lower()
        if "garbage" in cls_name:
            if is_garbage:
                filtered_detections.append(d)
        else:
            filtered_detections.append(d)
            
    detections = filtered_detections

    # AI 3: Auto-infer category from detections
    category = infer_category(detections)

    # AI 3: Severity Prediction
    severity, severity_score = predict_severity(detections, category)
    
    # Save Image
    image_filename = f"{current_user.id}_{file.filename}"
    image_path = UPLOAD_DIR / image_filename
    with open(image_path, "wb") as buffer:
        buffer.write(image_bytes)
        
    # AI 4: Duplicate Check
    phash = calculate_phash(image)
    stmt = select(Complaint).where(Complaint.category == category)
    result = await db.execute(stmt)
    existing_complaints = result.scalars().all()
    
    new_text = f"{title} {description}"
    is_dup, duplicate_of_id = is_duplicate(phash, latitude, longitude, new_text, existing_complaints)
    
    ai_summary = summarize_narrative(description, detections, image_caption)
    resolution_blueprint = generate_blueprint(title, description, category, severity.value)
    
    new_complaint = Complaint(
        user_id=current_user.id,
        submitted_by=current_user.name,
        title=title,
        description=description,
        category=category,
        latitude=latitude,
        longitude=longitude,
        severity=severity,
        severity_score=severity_score,
        image_path=str(image_path),
        phash=phash,
        ai_summary=ai_summary,
        resolution_blueprint=resolution_blueprint,
        is_duplicate=is_dup,
        duplicate_of=duplicate_of_id
    )
    
    db.add(new_complaint)
    await db.flush() # get ID
    
    for d in detections:
        det_record = DetectionResult(
            complaint_id=new_complaint.id,
            class_name=d["class_name"],
            confidence=d["confidence"],
            bbox_json=d["bbox_json"]
        )
        db.add(det_record)
        
    await db.commit()
    
    # Refresh to include relationships
    stmt = select(Complaint).options(selectinload(Complaint.detections)).where(Complaint.id == new_complaint.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.get("/", response_model=List[ComplaintResponse])
async def get_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(Complaint).options(selectinload(Complaint.detections))
    if current_user.role == RoleEnum.citizen:
        stmt = stmt.where(Complaint.user_id == current_user.id)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == RoleEnum.citizen:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Count by status
    status_counts = await db.execute(select(Complaint.status, func.count(Complaint.id)).group_by(Complaint.status))
    # Count by severity
    severity_counts = await db.execute(select(Complaint.severity, func.count(Complaint.id)).group_by(Complaint.severity))
    
    return {
        "status_counts": {s.value: c for s, c in status_counts.all() if s},
        "severity_counts": {s.value: c for s, c in severity_counts.all() if s}
    }

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    stmt = select(Complaint).options(selectinload(Complaint.detections)).where(Complaint.id == complaint_id)
    result = await db.execute(stmt)
    complaint = result.scalars().first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if current_user.role == RoleEnum.citizen and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return complaint

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == RoleEnum.citizen:
        raise HTTPException(status_code=403, detail="Not authorized to update status")
        
    stmt = select(Complaint).options(selectinload(Complaint.detections), selectinload(Complaint.user)).where(Complaint.id == complaint_id)
    result = await db.execute(stmt)
    complaint = result.scalars().first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    old_status = complaint.status
    complaint.status = status_update.status
    await db.commit()
    await db.refresh(complaint)
    
    if status_update.status == StatusEnum.accepted and complaint.user and complaint.user.email:
        email_sent = send_status_update_email(complaint.user.email, status_update.status.value, complaint.title)
        if not email_sent:
            print(f"\n[LOCAL FALLBACK] Status changed to {status_update.status.value} for report '{complaint.title}' by {complaint.user.email}")
            
    return complaint

@router.delete("/{complaint_id}")
async def delete_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == RoleEnum.citizen:
        raise HTTPException(status_code=403, detail="Not authorized to delete complaints")
        
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    result = await db.execute(stmt)
    complaint = result.scalars().first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    await db.delete(complaint)
    await db.commit()
    
    return {"message": "Complaint deleted successfully"}
