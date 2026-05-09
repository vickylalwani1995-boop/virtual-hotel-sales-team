"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";

export function ConciergeInput({
  onSend,
  disabled,
  streaming,
  onCancel,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    requestAnimationFrame(() => ref.current?.focus());
  }

  const charCount = value.length;
  const showCount = charCount > 500;

  return (
    <div className="border-t border-mhsp-line bg-white px-4 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-mhsp-line bg-white focus-within:border-mhsp-gold focus-within:ring-2 focus-within:ring-mhsp-gold/20 transition-all px-3 py-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask anything about hotel sales..."
          className="flex-1 resize-none bg-transparent text-[14px] leading-relaxed text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none max-h-[120px]"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 w-9 h-9 rounded-lg bg-mhsp-cream-warm hover:bg-mhsp-line flex items-center justify-center text-mhsp-navy transition-colors"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <span className="block w-2.5 h-2.5 bg-mhsp-navy rounded-sm" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            className="shrink-0 w-9 h-9 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-mhsp-navy transition-colors"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1">
        <p className="text-[10px] text-mhsp-muted/70">
          <kbd className="font-mono">Enter</kbd> to send ·{" "}
          <kbd className="font-mono">Shift+Enter</kbd> newline ·{" "}
          <kbd className="font-mono">Esc</kbd> close
        </p>
        {showCount && (
          <p className="text-[10px] font-numeric text-mhsp-muted/70">
            {charCount} chars
          </p>
        )}
      </div>
    </div>
  );
}
