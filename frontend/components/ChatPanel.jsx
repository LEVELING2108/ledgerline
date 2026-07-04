"use client";

import { useState } from "react";
import { Send, ChevronDown } from "lucide-react";

function Bubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-card px-3 py-2 text-body ${
          isUser
            ? "bg-teal text-white dark:bg-teal-dark dark:text-cream-dark"
            : "bg-surface-muted text-ink dark:bg-surface-muted-dark dark:text-ink-dark"
        }`}
      >
        <p>{message.text}</p>
        {message.trace && (
          <details className="group mt-1.5">
            <summary
              className="flex cursor-pointer list-none items-center gap-1 text-caption
                        text-muted dark:text-muted-dark"
            >
              <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
              Show underlying query
            </summary>
            <pre className="mt-1 overflow-x-auto rounded-card bg-cream p-2 text-caption
                            text-muted dark:bg-cream-dark dark:text-muted-dark">
              {message.trace}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * ChatPanel
 * @param {Array} messages - {id, role: "user"|"assistant", text, trace?}
 * @param {(text: string) => void} onSend
 * @param {boolean} [compact] - shorter history height, used when pinned on the dashboard
 * @param {string} [title] - defaults to "Ask about your finances"
 */
export default function ChatPanel({ messages, onSend, compact = false, title = "Ask about your finances" }) {
  const [draft, setDraft] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend?.(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col rounded-card border border-hairline bg-surface
                    dark:border-hairline-dark dark:bg-surface-dark">
      <div className="border-b border-hairline px-4 py-2.5 dark:border-hairline-dark">
        <p className="text-section-heading text-ink dark:text-ink-dark">{title}</p>
      </div>

      <div
        className={`flex-1 space-y-2 overflow-y-auto px-4 py-3 ${
          compact ? "max-h-40" : "max-h-full min-h-[50vh]"
        }`}
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-hairline p-3
                                          dark:border-hairline-dark">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. How much did I spend on dining last month?"
          className="flex-1 rounded-card border border-hairline bg-cream px-3 py-2 text-body
                    text-ink placeholder:text-muted focus:border-teal
                    dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark
                    dark:placeholder:text-muted-dark dark:focus:border-teal-dark"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card
                    bg-teal text-white hover:bg-teal/90 dark:bg-teal-dark dark:hover:bg-teal-dark/90"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
