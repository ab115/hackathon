from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey,
    Float, Text, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT = "student"
    JUDGE = "judge"
    MENTOR = "mentor"


class HackathonStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name       = Column(String(255))
    role            = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    profile_image   = Column(String, nullable=True)
    bio             = Column(Text, nullable=True)
    phone           = Column(String(20), nullable=True)
    college         = Column(String(255), nullable=True)
    city            = Column(String(100), nullable=True)
    state           = Column(String(100), nullable=True)
    skills          = Column(Text, nullable=True)
    interests       = Column(Text, nullable=True)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    token      = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_used    = Column(Boolean, default=False)

    user = relationship("User")


class Hackathon(Base):
    __tablename__ = "hackathons"

    id                 = Column(Integer, primary_key=True, index=True)
    title              = Column(String(255), index=True, nullable=False)   # was 'name'
    description        = Column(Text)
    category           = Column(String(100))
    status             = Column(SQLEnum(HackathonStatus), default=HackathonStatus.OPEN, nullable=False)
    start_date         = Column(DateTime(timezone=True))
    end_date           = Column(DateTime(timezone=True))
    registration_start = Column(DateTime(timezone=True))
    registration_end   = Column(DateTime(timezone=True))
    registration_fee   = Column(Float, default=0.0)
    prize_pool         = Column(Float, default=0.0)
    max_teams          = Column(Integer)
    team_size          = Column(Integer, default=4)
    is_public          = Column(Boolean, default=True)
    banner_image       = Column(String, nullable=True)
    problem_statement  = Column(Text, nullable=True)
    problem_statement_file = Column(String, nullable=True)
    rules              = Column(Text, nullable=True)
    timeline           = Column(Text, nullable=True)
    created_by         = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at         = Column(DateTime(timezone=True), server_default=func.now())


class Team(Base):
    __tablename__ = "teams"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(255), index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"))
    creator_id   = Column(Integer, ForeignKey("users.id"))
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    hackathon = relationship("Hackathon")
    members   = relationship("TeamMember", back_populates="team")

    __table_args__ = (
        Index("ix_teams_hackathon_creator", "hackathon_id", "creator_id"),
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id      = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role    = Column(String(50), default="member")  # leader | member
    status  = Column(String(50), default="PENDING") # PENDING | ACCEPTED | REJECTED

    team = relationship("Team", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        Index("ix_team_members_user_team", "user_id", "team_id"),
        Index("ix_team_members_status", "status"),
    )


class Submission(Base):
    __tablename__ = "submissions"

    id             = Column(Integer, primary_key=True, index=True)
    team_id        = Column(Integer, ForeignKey("teams.id"))
    hackathon_id   = Column(Integer, ForeignKey("hackathons.id"), index=True)
    title          = Column(String(255))
    description    = Column(Text)
    repo_url       = Column(String)
    demo_url       = Column(String)
    tech_stack     = Column(String(500), nullable=True)
    score          = Column(Float, default=0.0)
    judge_feedback = Column(Text)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_submissions_team_hackathon", "team_id", "hackathon_id"),
        Index("ix_submissions_score", "hackathon_id", "score"),
    )


class Registration(Base):
    __tablename__ = "registrations"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), index=True)
    hackathon_id     = Column(Integer, ForeignKey("hackathons.id"), index=True)
    team_id          = Column(Integer, ForeignKey("teams.id"), nullable=True)
    registration_fee = Column(Float, default=0.0)                       # was missing
    payment_status   = Column(String(50), default="PENDING")            # PENDING | SUCCESS | FAILED | FREE
    transaction_id   = Column(String(255), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    # Composite index for fast lookups by user + hackathon
    __table_args__ = (
        Index("ix_registrations_user_hackathon", "user_id", "hackathon_id"),
        Index("ix_registrations_txnid", "transaction_id"),
    )


class Resource(Base):
    __tablename__ = "resources"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), index=True, nullable=False)
    type        = Column(String(50), nullable=False) # tutorial, template, doc, tool
    description = Column(Text)
    url         = Column(String, nullable=True)
    duration    = Column(String(50), nullable=True)
    level       = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    category    = Column(String(100), nullable=True)
    downloads   = Column(Integer, default=0)
    rating      = Column(Float, default=0.0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())


class Mentor(Base):
    __tablename__ = "mentors"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(255), index=True, nullable=False)
    title        = Column(String(255), nullable=True)
    expertise    = Column(Text, nullable=True)  # comma separated
    rating       = Column(Float, default=0.0)
    sessions     = Column(Integer, default=0)
    price          = Column(Float, default=0.0)
    availability   = Column(Text, nullable=True)  # description
    available_from = Column(DateTime(timezone=True), nullable=True)
    available_to   = Column(DateTime(timezone=True), nullable=True)
    avatar         = Column(String, nullable=True)
    meeting_link   = Column(String, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())


class MentorshipBooking(Base):
    __tablename__ = "mentorship_bookings"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), index=True)
    mentor_id        = Column(Integer, ForeignKey("mentors.id"), index=True)
    topic            = Column(String(255), nullable=True)
    booking_fee      = Column(Float, default=0.0)
    payment_status   = Column(String(50), default="PENDING") # PENDING | SUCCESS | FAILED
    transaction_id   = Column(String(255), nullable=True)
    scheduled_at     = Column(String(100), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    mentor = relationship("Mentor")
    user = relationship("User")
