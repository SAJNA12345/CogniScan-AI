"""Lexical, syntactic and semantic biomarker extraction.

Implements classic language markers shown to discriminate cognitive decline:
lexical richness (TTR, MATTR, Brunet, Honore), propositional/idea density,
syntactic complexity (mean dependency distance), and semantic coherence
(adjacent-sentence embedding similarity). spaCy and the sentence-embedding
model are loaded lazily and cached.
"""

from __future__ import annotations

import math
from collections import Counter

# Propositional ("idea") words: verbs, adjectives, adverbs, prepositions,
# and conjunctions (Turner & Greene proposition approximation).
PROPOSITION_POS = {"VERB", "ADJ", "ADV", "ADP", "CCONJ", "SCONJ"}
CONTENT_POS = {"NOUN", "PROPN", "VERB", "ADJ", "ADV"}
FILLERS = {"um", "uh", "er", "ah", "hmm", "like", "you know", "well"}

MATTR_WINDOW = 25

_nlp = None
_embedder = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy

        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def _get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer

        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def _mattr(tokens: list[str], window: int = MATTR_WINDOW):
    if len(tokens) < window:
        return (len(set(tokens)) / len(tokens)) if tokens else None
    ratios = [
        len(set(tokens[i : i + window])) / window
        for i in range(len(tokens) - window + 1)
    ]
    return sum(ratios) / len(ratios)


def _brunet(n_tokens: int, n_types: int):
    # W = N ** (V ** -0.165); lower W => richer vocabulary.
    if n_tokens <= 0 or n_types <= 0:
        return None
    return n_tokens ** (n_types ** -0.165)


def _honore(n_tokens: int, n_types: int, hapax: int):
    # R = 100 * logN / (1 - V1/V); higher => richer.
    if n_tokens <= 0 or n_types <= 0 or hapax >= n_types:
        return None
    return 100.0 * math.log(n_tokens) / (1.0 - (hapax / n_types))


def _semantic_coherence(sentences: list[str]):
    if len(sentences) < 2:
        return None
    import numpy as np

    emb = _get_embedder().encode(sentences, normalize_embeddings=True)
    sims = [float(np.dot(emb[i], emb[i + 1])) for i in range(len(emb) - 1)]
    return sum(sims) / len(sims) if sims else None


def extract(text: str) -> dict:
    text = (text or "").strip()
    if not text:
        return {"word_count": 0, "unique_words": 0}

    doc = _get_nlp()(text)
    word_tokens = [t.text.lower() for t in doc if t.is_alpha]
    word_count = len(word_tokens)
    if word_count == 0:
        return {"word_count": 0, "unique_words": 0}

    freq = Counter(word_tokens)
    n_types = len(freq)
    hapax = sum(1 for c in freq.values() if c == 1)

    prop_count = sum(1 for t in doc if t.pos_ in PROPOSITION_POS)
    content_count = sum(1 for t in doc if t.pos_ in CONTENT_POS)

    sents = [s.text.strip() for s in doc.sents if s.text.strip()]
    sent_lengths = [len([t for t in s if t.is_alpha]) for s in doc.sents]
    mean_sent_len = (sum(sent_lengths) / len(sent_lengths)) if sent_lengths else None

    # Mean dependency distance = average |token.i - token.head.i| (syntactic load)
    dep_dists = [abs(t.i - t.head.i) for t in doc if t.head != t]
    mean_dep = (sum(dep_dists) / len(dep_dists)) if dep_dists else None

    low = text.lower()
    filler_hits = sum(low.count(f) for f in FILLERS)

    def r(x, n=4):
        return round(x, n) if x is not None else None

    return {
        "word_count": word_count,
        "unique_words": n_types,
        "type_token_ratio": r(n_types / word_count),
        "moving_avg_ttr": r(_mattr(word_tokens)),
        "brunet_index": r(_brunet(word_count, n_types), 3),
        "honore_statistic": r(_honore(word_count, n_types, hapax), 2),
        "idea_density": r(prop_count / word_count),
        "content_word_ratio": r(content_count / word_count),
        "mean_sentence_length": r(mean_sent_len, 2),
        "mean_dependency_distance": r(mean_dep, 3),
        "semantic_coherence": r(_semantic_coherence(sents)),
        "max_repetition": max(freq.values()),
        "filler_ratio": r(filler_hits / word_count),
    }
