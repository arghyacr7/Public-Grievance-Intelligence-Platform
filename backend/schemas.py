from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import RoleEnum, StatusEnum, SeverityEnum

# Auth Schemas
class GoogleLoginRequest(BaseModel):
    credential: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    auth_provider: str
    model_config = ConfigDict(from_attributes=True)

# Detection Schemas
class DetectionResultBase(BaseModel):
    class_name: str
    confidence: float
    bbox_json: str

class DetectionResultResponse(DetectionResultBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Complaint Schemas
class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdateStatus(BaseModel):
    status: StatusEnum

class ComplaintResponse(ComplaintBase):
    id: int
    user_id: Optional[int]
    submitted_by: Optional[str]
    status: StatusEnum
    severity: Optional[SeverityEnum]
    severity_score: Optional[float]
    image_path: str
    ai_summary: Optional[str]
    resolution_blueprint: Optional[str]
    is_duplicate: bool
    duplicate_of: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    detections: List[DetectionResultResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
