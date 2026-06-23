"""Response schemas for the digital-biomarker service.

These define the stable contract the agentic backend consumes. Every field is
optional-tolerant: poor-quality audio or very short speech may leave some
biomarkers unavailable (None) rather than failing the whole request.
"""

from typing import Optional

from pydantic import BaseModel


class AcousticFeatures(BaseModel):
    """Voice/timing biomarkers. Pause and rate metrics are robust dementia
    markers; pitch/jitter/shimmer capture vocal stability."""

    duration_sec: Optional[float] = None
    speech_duration_sec: Optional[float] = None
    pause_ratio: Optional[float] = None          # silence / total time
    pause_count: Optional[int] = None
    mean_pause_sec: Optional[float] = None
    speech_rate_wpm: Optional[float] = None
    pitch_mean_hz: Optional[float] = None
    pitch_sd_hz: Optional[float] = None
    jitter_local: Optional[float] = None
    shimmer_local: Optional[float] = None


class LinguisticFeatures(BaseModel):
    """Lexical, syntactic and semantic biomarkers extracted from the
    transcript."""

    word_count: int = 0
    unique_words: int = 0
    type_token_ratio: Optional[float] = None
    moving_avg_ttr: Optional[float] = None       # MATTR, window=25
    brunet_index: Optional[float] = None         # lower = richer
    honore_statistic: Optional[float] = None     # higher = richer
    idea_density: Optional[float] = None         # propositional density
    content_word_ratio: Optional[float] = None
    mean_sentence_length: Optional[float] = None
    mean_dependency_distance: Optional[float] = None  # syntactic complexity
    semantic_coherence: Optional[float] = None   # mean adjacent-sentence cosine
    max_repetition: Optional[int] = None
    filler_ratio: Optional[float] = None


class ContributingFactor(BaseModel):
    feature: str
    value: Optional[float] = None
    direction: str          # "impairment" | "protective"
    weighted_z: float


class RiskAssessment(BaseModel):
    risk_score: Optional[float] = None           # 0..1
    risk_band: Optional[str] = None              # low | moderate | high
    uncertainty: Optional[float] = None          # 0..1, higher = less reliable
    contributing_factors: list[ContributingFactor] = []
    method: str = "heuristic-baseline-v1"
    disclaimer: str = (
        "Screening signal only — not a diagnosis. Heuristic baseline pending a "
        "model trained on a labeled clinical corpus."
    )


class AnalyzeResponse(BaseModel):
    transcript: str
    acoustic: AcousticFeatures
    linguistic: LinguisticFeatures
    risk: RiskAssessment
