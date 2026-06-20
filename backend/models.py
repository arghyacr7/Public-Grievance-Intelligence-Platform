from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    citizen = "citizen"
    officer = "officer"
    admin = "admin"

class StatusEnum(str, enum.Enum):
    submitted = "Submitted"
    seen = "Seen"
    verified = "Verified"
    accepted = "Accepted"
    resolved = "Resolved"

class SeverityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150))
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    auth_provider = Column(String(50), default="local")
    role = Column(Enum(RoleEnum), default=RoleEnum.citizen)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaints = relationship("Complaint", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_by = Column(String(150), nullable=True)
    title = Column(String(255))
    description = Column(Text)
    category = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(Enum(StatusEnum), default=StatusEnum.submitted)
    severity = Column(Enum(SeverityEnum), nullable=True)
    severity_score = Column(Float, nullable=True)
    image_path = Column(String(500))
    phash = Column(String(100), nullable=True)
    ai_summary = Column(Text, nullable=True)
    resolution_blueprint = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="complaints")
    detections = relationship("DetectionResult", back_populates="complaint", cascade="all, delete-orphan")

class DetectionResult(Base):
    __tablename__ = "detection_results"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    class_name = Column(String(100))
    confidence = Column(Float)
    bbox_json = Column(String(255)) # Store as JSON string: "[x1, y1, x2, y2]"

    complaint = relationship("Complaint", back_populates="detections")



