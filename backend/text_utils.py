import re
from typing import AsyncIterable, Union


def clean_for_tts(text: str) -> str:
    """Strip markdown and special formatting so TTS speaks naturally."""
    # Markdown headers: ## Title → Title
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    # Bold / italic: **text**, *text*, __text__, _text_
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"_{1,3}(.*?)_{1,3}", r"\1", text, flags=re.DOTALL)
    # Inline code: `code`
    text = re.sub(r"`+([^`]*)`+", r"\1", text)
    # Blockquotes: > text
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # Unordered list bullets: -, *, +
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    # Ordered list numbers: 1. 2. etc.
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
    # Horizontal rules: ---, ***, ___
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    # Markdown links [text](url) → text
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    # Images ![alt](url) → (nothing)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    # Em dash / en dash → natural pause via comma
    text = re.sub(r"\s*[—–]\s*", ", ", text)
    # Remaining symbols that TTS reads aloud awkwardly
    text = re.sub(r"[#|~^\\]", "", text)
    # Collapse multiple newlines to a single space
    text = re.sub(r"\n+", " ", text)
    # Collapse multiple spaces
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


async def before_tts_cb(
    agent_session,  # AgentSession — avoid circular import
    text: Union[str, AsyncIterable[str]],
) -> Union[str, AsyncIterable[str]]:
    """LiveKit AgentSession hook: clean text before it reaches TTS."""
    if isinstance(text, str):
        return clean_for_tts(text)
    # Collect streamed chunks (typically one sentence at a time from LiveKit),
    # clean as a whole so multi-token markdown patterns are handled correctly.
    chunks: list[str] = []
    async for chunk in text:
        chunks.append(chunk)
    return clean_for_tts("".join(chunks))
