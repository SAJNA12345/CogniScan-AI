"""Thin Groq Cloud client wrapper with a tool-use agent loop.

Groq exposes an OpenAI-compatible Chat Completions API, so we drive it with the
openai SDK pointed at the Groq base URL. `run_agent` runs the standard
function-calling cycle: call the model, execute any requested tools, feed the
results back, repeat until a final answer. Every step is appended to a shared
`trace` so the whole agent network is inspectable.
"""

from __future__ import annotations

import json
from typing import Any, Callable, Optional

from config import settings

_client = None


class LLMUnavailable(RuntimeError):
    pass


def _client_or_raise():
    global _client
    if not settings.llm_enabled:
        raise LLMUnavailable("GROQ_API_KEY is not configured")
    if _client is None:
        from openai import OpenAI

        _client = OpenAI(api_key=settings.GROQ_API_KEY, base_url=settings.GROQ_BASE_URL)
    return _client


def _is_tool_format_error(e: Exception) -> bool:
    s = str(e)
    return "tool_use_failed" in s or "Failed to call a function" in s


def _create_with_fallback(client, kwargs: dict):
    """Groq's Llama models occasionally emit a malformed tool call that the API
    rejects with `tool_use_failed`. Retry once (a stochastic re-roll), then fall
    back to a tool-less call so the agent still completes and returns its answer.
    """
    try:
        return client.chat.completions.create(**kwargs)
    except Exception as e:
        if not _is_tool_format_error(e):
            raise
    try:
        return client.chat.completions.create(**kwargs)
    except Exception as e:
        if not _is_tool_format_error(e):
            raise
    kwargs = {k: v for k, v in kwargs.items() if k not in ("tools", "tool_choice")}
    return client.chat.completions.create(**kwargs)


def run_agent(
    *,
    label: str,
    model: str,
    system: str,
    messages: list[dict],
    tools: Optional[list[dict]] = None,
    tool_handlers: Optional[dict[str, Callable[[dict], Any]]] = None,
    max_tokens: int = 2048,
    trace: Optional[list] = None,
) -> str:
    """Run one agent to completion (resolving tool calls). Returns final text."""
    client = _client_or_raise()
    tools = tools or []
    tool_handlers = tool_handlers or {}
    msgs: list[dict] = [{"role": "system", "content": system}, *messages]
    tool_events: list[dict] = []

    while True:
        # Only send tools/tool_choice when we actually have tools — Groq rejects
        # a null tool_choice (unlike the OpenAI/xAI endpoints).
        kwargs = {"model": model, "max_tokens": max_tokens, "messages": msgs}
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
        resp = _create_with_fallback(client, kwargs)
        msg = resp.choices[0].message

        if msg.tool_calls:
            msgs.append(
                {
                    "role": "assistant",
                    "content": msg.content or None,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in msg.tool_calls
                    ],
                }
            )
            for tc in msg.tool_calls:
                name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                handler = tool_handlers.get(name)
                try:
                    out = handler(args) if handler else {"error": "unknown tool"}
                except Exception as e:  # surface tool failure to the model
                    out = {"error": str(e)}
                tool_events.append({"tool": name, "input": args, "result": out})
                msgs.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(out),
                    }
                )
            continue

        text = msg.content or ""
        if trace is not None:
            trace.append(
                {
                    "agent": label,
                    "model": model,
                    "tool_calls": tool_events,
                    "output": text,
                }
            )
        return text


def parse_json(text: str) -> dict:
    """Lenient JSON extraction from a model response."""
    text = (text or "").strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1].lstrip("json").strip() if "```" in text else text
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass
    return {"_raw": text}
