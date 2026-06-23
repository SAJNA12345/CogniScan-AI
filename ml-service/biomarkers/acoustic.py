"""Acoustic biomarker extraction.

Timing biomarkers (pauses, speech rate) are derived from Whisper's segment
timestamps; voice-quality biomarkers (pitch, jitter, shimmer) come from Praat
via parselmouth. Each metric degrades to None on unsuitable audio rather than
raising, so partial results still flow through the pipeline.
"""

from __future__ import annotations

# Gaps between speech segments longer than this (seconds) count as pauses.
PAUSE_THRESHOLD_SEC = 0.3


def _timing_features(segments: list[dict], word_count: int, duration_sec: float):
    """Pause and speech-rate metrics from Whisper segment timestamps."""
    speech_duration = sum(
        max(0.0, float(s["end"]) - float(s["start"])) for s in segments
    )

    # Inter-segment silences above threshold are pauses.
    pauses = []
    for prev, nxt in zip(segments, segments[1:]):
        gap = float(nxt["start"]) - float(prev["end"])
        if gap >= PAUSE_THRESHOLD_SEC:
            pauses.append(gap)

    pause_total = max(0.0, duration_sec - speech_duration)
    pause_ratio = (pause_total / duration_sec) if duration_sec else None
    mean_pause = (sum(pauses) / len(pauses)) if pauses else 0.0
    speech_rate_wpm = (
        (word_count / (speech_duration / 60.0)) if speech_duration > 0 else None
    )

    return {
        "speech_duration_sec": round(speech_duration, 3),
        "pause_ratio": round(pause_ratio, 4) if pause_ratio is not None else None,
        "pause_count": len(pauses),
        "mean_pause_sec": round(mean_pause, 3),
        "speech_rate_wpm": round(speech_rate_wpm, 1) if speech_rate_wpm else None,
    }


def _voice_quality(wav_path: str):
    """Pitch / jitter / shimmer via Praat. Returns Nones if extraction fails."""
    out = {
        "duration_sec": None,
        "pitch_mean_hz": None,
        "pitch_sd_hz": None,
        "jitter_local": None,
        "shimmer_local": None,
    }
    try:
        import parselmouth
        from parselmouth.praat import call

        snd = parselmouth.Sound(wav_path)
        out["duration_sec"] = round(snd.get_total_duration(), 3)

        pitch = snd.to_pitch()
        mean_f0 = call(pitch, "Get mean", 0, 0, "Hertz")
        sd_f0 = call(pitch, "Get standard deviation", 0, 0, "Hertz")
        out["pitch_mean_hz"] = round(mean_f0, 2) if mean_f0 == mean_f0 else None
        out["pitch_sd_hz"] = round(sd_f0, 2) if sd_f0 == sd_f0 else None

        point_process = call(snd, "To PointProcess (periodic, cc)", 75, 500)
        jitter = call(point_process, "Get jitter (local)", 0, 0, 1e-4, 0.02, 1.3)
        shimmer = call(
            [snd, point_process], "Get shimmer (local)",
            0, 0, 1e-4, 0.02, 1.3, 1.6,
        )
        out["jitter_local"] = round(jitter, 5) if jitter == jitter else None
        out["shimmer_local"] = round(shimmer, 5) if shimmer == shimmer else None
    except Exception:
        # Audio too short/noisy for periodicity analysis — leave Nones.
        pass
    return out


def extract(wav_path: str, segments: list[dict], word_count: int) -> dict:
    voice = _voice_quality(wav_path)

    # Prefer Praat's duration; fall back to the last segment end.
    duration = voice["duration_sec"]
    if not duration and segments:
        duration = float(segments[-1]["end"])
    duration = duration or 0.0

    timing = _timing_features(segments, word_count, duration)
    return {"duration_sec": round(duration, 3), **timing, **voice}
