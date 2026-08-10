"""
ai.py
-----
Optional local AI assistant layer built on top of Phi-3 Mini (GGUF, via
llama-cpp-python).

Scope (important): this module NEVER searches the dataset and NEVER
invents new troubleshooting steps. SearchEngine remains the only thing
responsible for finding the correct record. AIEngine only explains,
summarizes, or answers follow-up questions about a record that has
already been found - the JSON dataset stays the single source of
truth, and the model is only allowed to reason about the record text
it is handed in the prompt.

Design:
    - The model is loaded exactly once, inside AIEngine.__init__, and
      kept in memory for the lifetime of the application. app.py
      creates exactly one AIEngine instance at startup and reuses it.
    - If llama-cpp-python isn't installed, or the .gguf file is
      missing, or loading fails for any other reason, AIEngine
      degrades gracefully: `self.available` becomes False and
      `ask()` returns a friendly message instead of raising. Nothing
      in this module ever crashes the host application.
"""

from __future__ import annotations

import dataclasses
import json
from pathlib import Path
from typing import Any, Dict, Optional

try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False


DEFAULT_MODEL_PATH = "models/phi-3-mini.gguf"

SYSTEM_PROMPT = (
    "You are an experienced IT Help Desk Engineer.\n"
    "Answer ONLY using the troubleshooting record below.\n"
    "If the answer cannot be found in the record, politely say that the "
    "information is not available.\n"
    "Do not invent new solutions.\n"
    "Keep answers concise, professional, and easy to understand."
)


class AIEngine:
    """Loads Phi-3 Mini once and answers questions grounded in a single
    troubleshooting record.

    Usage:
        engine = AIEngine()                 # load once, at app startup
        if engine.available:
            answer = engine.ask(record, "Why should I restart the spooler?")
    """

    def __init__(
        self,
        model_path: str = DEFAULT_MODEL_PATH,
        n_ctx: int = 4096,
        temperature: float = 0.2,
        top_p: float = 0.9,
        max_tokens: int = 400,
        repeat_penalty: float = 1.1,
    ) -> None:
        self.model_path = model_path
        self.n_ctx = n_ctx
        self.temperature = temperature
        self.top_p = top_p
        self.max_tokens = max_tokens
        self.repeat_penalty = repeat_penalty

        self.llm: Optional["Llama"] = None
        self.available: bool = False
        self.status_message: str = ""

        self._load_model()

    # ------------------------------------------------------------------
    # Model loading (runs once, at construction time)
    # ------------------------------------------------------------------
    def _load_model(self) -> None:
        """Attempts to load the GGUF model exactly once.

        Never raises: any failure just leaves AI mode disabled
        (self.available = False) so the rest of the application keeps
        working normally without AI follow-up questions.
        """
        if not LLAMA_CPP_AVAILABLE:
            self.status_message = (
                "llama-cpp-python is not installed. AI mode disabled. "
                "Install it with: pip install llama-cpp-python"
            )
            self.available = False
            return

        model_file = Path(self.model_path)
        if not model_file.exists():
            self.status_message = f"Phi-3 Mini model not found at '{self.model_path}'."
            self.available = False
            return

        try:
            self.llm = Llama(
                model_path=str(model_file),
                n_ctx=self.n_ctx,
                verbose=False,
            )
            self.available = True
            self.status_message = "Phi-3 Mini loaded and ready."
        except Exception as exc:  # noqa: BLE001 - any load failure disables AI, never crashes the app
            self.llm = None
            self.available = False
            self.status_message = f"Failed to load Phi-3 Mini: {exc}"

    # ------------------------------------------------------------------
    # Prompt construction
    # ------------------------------------------------------------------
    @staticmethod
    def _record_to_dict(record: Any) -> Dict[str, Any]:
        """Converts a TroubleshootingRecord into a plain dict for the
        prompt. Works whether the record is a dataclass, a plain object
        with a __dict__, or already a dict."""
        if dataclasses.is_dataclass(record):
            return dataclasses.asdict(record)
        if isinstance(record, dict):
            return record
        if hasattr(record, "__dict__"):
            return dict(record.__dict__)
        raise TypeError(f"Don't know how to serialize record of type {type(record)!r}")

    def _build_prompt(self, record: Any, question: str) -> str:
        """Builds the exact prompt template requested: system instructions,
        the full record as JSON, and the user's question. The model only
        ever sees this one record - never the whole dataset."""
        record_dict = self._record_to_dict(record)
        record_json = json.dumps(record_dict, indent=2, ensure_ascii=False, default=str)

        return (
            f"System:\n{SYSTEM_PROMPT}\n\n"
            "--------------------------------\n\n"
            f"Troubleshooting Record:\n{record_json}\n\n"
            "--------------------------------\n\n"
            f"User Question:\n{question}\n\n"
            "--------------------------------\n\n"
            "A:"
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def ask(self, record: Any, question: str) -> str:
        """Answers `question` using only the given troubleshooting record.

        Always returns a string and never raises, so callers (app.py)
        can display the result unconditionally without a try/except.
        """
        if not self.available or self.llm is None:
            return "AI assistant is not available right now."

        question = (question or "").strip()
        if not question:
            return "Please enter a question."

        prompt = self._build_prompt(record, question)

        try:
            result = self.llm(
                prompt,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p,
                repeat_penalty=self.repeat_penalty,
                stop=["User Question:", "\nSystem:", "--------------------------------"],
            )
            answer = result["choices"][0]["text"].strip()
            return answer or "I couldn't generate an answer for that. Try rephrasing your question."
        except Exception as exc:  # noqa: BLE001 - keep the app alive even if generation fails mid-run
            return f"AI generation failed: {exc}"