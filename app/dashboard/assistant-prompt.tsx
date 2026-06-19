"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

const placeholder = "Ask ORIVOO AI to plan, write, design, research, or build...";

export function AssistantPrompt() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState(
    "Build a launch-ready brief, create a research map, and draft the first landing page section for ORIVOO AI.",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      return;
    }

    setSubmittedPrompt(nextPrompt);
    setPrompt("");

    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-3">
      <div className="min-h-32 rounded-2xl bg-panel-soft p-5">
        <p className="text-sm text-muted">Assistant prompt</p>
        <p className="mt-3 whitespace-pre-wrap text-lg text-white">
          {submittedPrompt}
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-end gap-3 rounded-[1.75rem] border border-white/10 bg-black/60 p-2 pl-5 transition focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/20"
      >
        <label htmlFor="assistant-prompt" className="sr-only">
          Assistant prompt
        </label>
        <textarea
          id="assistant-prompt"
          ref={textareaRef}
          value={prompt}
          rows={1}
          placeholder={placeholder}
          onChange={(event) => {
            setPrompt(event.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="gold-gradient flex size-10 shrink-0 items-center justify-center rounded-full text-black transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!prompt.trim()}
        >
          <ArrowUp className="size-4" aria-hidden />
          <span className="sr-only">Send prompt</span>
        </button>
      </form>
    </div>
  );
}
