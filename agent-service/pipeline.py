"""Agent orchestration: the Phase 1 multi-agent loop.

Flow for a full assessment:
    Orchestrator (plan) -> Clinical-Reasoning (grounded, tool-using)
        -> Safety/Guardrail (review+sanitize) -> Report (patient+clinician)

Each stage records to a shared trace so the whole agent network is inspectable.
"""

from __future__ import annotations

import json

import prompts
import tools
from llm import parse_json, run_agent
from config import settings


def _fmt(obj) -> str:
    return json.dumps(obj, indent=2, default=str)


def run_orchestrator(inputs: dict, trace: list) -> dict:
    available = {
        "speech": bool(inputs.get("speech")),
        "cognitive": inputs.get("cognitive_score") is not None,
        "functional": inputs.get("functional_score") is not None,
        "risk_factors": bool(inputs.get("risk_factors")),
    }
    text = run_agent(
        label="orchestrator",
        model=settings.MODEL_CONDUCTOR,
        system=prompts.ORCHESTRATOR,
        messages=[{"role": "user", "content": f"Available inputs:\n{_fmt(available)}"}],
        max_tokens=512,
        trace=trace,
    )
    return parse_json(text)


def run_reasoning(inputs: dict, trace: list) -> dict:
    text = run_agent(
        label="clinical_reasoner",
        model=settings.MODEL_REASONING,
        system=prompts.REASONER,
        messages=[
            {
                "role": "user",
                "content": "Screening signals for this session:\n" + _fmt(inputs),
            }
        ],
        tools=[tools.LOOKUP_GUIDELINE_TOOL],
        tool_handlers={"lookup_guideline": tools.lookup_guideline},
        max_tokens=1500,
        trace=trace,
    )
    return parse_json(text)


def run_safety(reasoning: dict, trace: list) -> dict:
    text = run_agent(
        label="safety_guardrail",
        model=settings.MODEL_FAST,
        system=prompts.SAFETY_REVIEWER,
        messages=[{"role": "user", "content": "Draft assessment:\n" + _fmt(reasoning)}],
        max_tokens=1024,
        trace=trace,
    )
    return parse_json(text)


def run_report(reasoning: dict, safety: dict, trace: list) -> dict:
    payload = {"assessment": reasoning, "safety_review": safety}
    text = run_agent(
        label="reporter",
        model=settings.MODEL_CONDUCTOR,
        system=prompts.REPORTER,
        messages=[{"role": "user", "content": _fmt(payload)}],
        max_tokens=1500,
        trace=trace,
    )
    return parse_json(text)


def run_full_assessment(inputs: dict) -> dict:
    """Orchestrator -> reasoning -> safety -> report, with a full trace."""
    trace: list = []
    plan = run_orchestrator(inputs, trace)
    reasoning = run_reasoning(inputs, trace)
    safety = run_safety(reasoning, trace)
    report = run_report(reasoning, safety, trace)
    return {
        "plan": plan,
        "biomarkers": inputs.get("speech"),
        "reasoning": reasoning,
        "safety": safety,
        "report": report,
        "trace": trace,
    }


def run_interview_turn(history: list[dict]) -> dict:
    """One turn of the conversational cognitive interviewer (stateless;
    the client passes the running history each call)."""
    trace: list = []
    messages = history or [
        {"role": "user", "content": "Please begin the cognitive screening."}
    ]
    text = run_agent(
        label="cognitive_interviewer",
        model=settings.MODEL_CONDUCTOR,
        system=prompts.INTERVIEWER,
        messages=messages,
        max_tokens=512,
        trace=trace,
    )
    complete = "[ASSESSMENT_COMPLETE]" in text
    message = text.replace("[ASSESSMENT_COMPLETE]", "").strip()
    return {"message": message, "complete": complete, "trace": trace}
