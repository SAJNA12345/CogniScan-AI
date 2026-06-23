"""Transparent, explainable risk scoring.

This is a deliberately interpretable BASELINE, not a trained classifier. Each
biomarker is z-scored against an approximate healthy reference norm (informed
by the dementia speech-biomarker literature, e.g. the ADReSS corpus), oriented
so positive z = more impairment, then combined as a weighted mean and squashed
to a 0..1 risk. The reference norms live in one place so a model trained on a
labeled corpus can replace this module without changing the API contract.
"""

from __future__ import annotations

import math


class Norm:
    __slots__ = ("mean", "sd", "direction", "weight")

    def __init__(self, mean, sd, direction, weight=1.0):
        self.mean = mean
        self.sd = sd
        self.direction = direction  # "higher_impaired" | "lower_impaired"
        self.weight = weight


# Approximate healthy reference norms (mean, sd, impairment direction, weight).
# Tunable baselines — replace with fitted values when a labeled corpus exists.
NORMS = {
    "pause_ratio":             Norm(0.30, 0.12, "higher_impaired", 1.2),
    "mean_pause_sec":          Norm(0.50, 0.30, "higher_impaired", 0.8),
    "speech_rate_wpm":         Norm(130.0, 35.0, "lower_impaired", 1.0),
    "idea_density":            Norm(0.50, 0.08, "lower_impaired", 1.2),
    "moving_avg_ttr":          Norm(0.72, 0.08, "lower_impaired", 1.0),
    "brunet_index":            Norm(11.0, 2.0, "higher_impaired", 0.8),
    "honore_statistic":        Norm(1200.0, 350.0, "lower_impaired", 0.8),
    "semantic_coherence":      Norm(0.45, 0.12, "lower_impaired", 1.2),
    "mean_dependency_distance": Norm(2.6, 0.7, "lower_impaired", 0.8),
    "filler_ratio":            Norm(0.03, 0.03, "higher_impaired", 0.6),
}

Z_CAP = 3.0


def _oriented_z(value: float, norm: Norm) -> float:
    if norm.sd <= 0:
        return 0.0
    z = (value - norm.mean) / norm.sd
    if norm.direction == "lower_impaired":
        z = -z
    return max(-Z_CAP, min(Z_CAP, z))


def _band(risk: float) -> str:
    if risk < 0.34:
        return "low"
    if risk < 0.67:
        return "moderate"
    return "high"


def _uncertainty(coverage: float, word_count: int, duration: float) -> float:
    adequacy = min(1.0, word_count / 50.0) * min(1.0, (duration or 0) / 30.0)
    u = 1.0 - 0.5 * coverage - 0.5 * adequacy
    return round(max(0.05, min(0.95, u)), 3)


def score(acoustic: dict, linguistic: dict) -> dict:
    features = {**acoustic, **linguistic}

    contributions = []
    weighted_sum = 0.0
    weight_total = 0.0
    for name, norm in NORMS.items():
        val = features.get(name)
        if val is None:
            continue
        z = _oriented_z(float(val), norm)
        wz = z * norm.weight
        weighted_sum += wz
        weight_total += norm.weight
        contributions.append(
            {
                "feature": name,
                "value": round(float(val), 4),
                "direction": "impairment" if z > 0 else "protective",
                "weighted_z": round(wz, 3),
            }
        )

    if weight_total == 0:
        return {
            "risk_score": None,
            "risk_band": None,
            "uncertainty": 0.95,
            "contributing_factors": [],
        }

    aggregate = weighted_sum / weight_total
    risk = 1.0 / (1.0 + math.exp(-aggregate))

    coverage = len(contributions) / len(NORMS)
    uncertainty = _uncertainty(
        coverage,
        linguistic.get("word_count", 0),
        acoustic.get("duration_sec", 0.0),
    )

    contributions.sort(key=lambda c: abs(c["weighted_z"]), reverse=True)
    return {
        "risk_score": round(risk, 4),
        "risk_band": _band(risk),
        "uncertainty": uncertainty,
        "contributing_factors": contributions[:5],
    }
