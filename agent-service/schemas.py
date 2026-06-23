from typing import Any, Optional

from pydantic import BaseModel


class AssessRequest(BaseModel):
    """Already-extracted signals. `speech` is an ml-service AnalyzeResponse."""

    speech: Optional[dict] = None
    transcript: Optional[str] = None
    cognitive_score: Optional[float] = None
    functional_score: Optional[float] = None
    risk_factors: Optional[dict] = None
    patient_context: Optional[str] = None


class AssessResponse(BaseModel):
    plan: dict
    biomarkers: Optional[dict] = None
    reasoning: dict
    safety: dict
    report: dict
    trace: list[Any]


class Message(BaseModel):
    role: str
    content: str


class InterviewTurnRequest(BaseModel):
    history: list[Message] = []


class InterviewTurnResponse(BaseModel):
    message: str
    complete: bool
    trace: list[Any]
