import React, { useEffect, useRef } from "react";
import "./ConversationHistory.css";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Props {
  messages: ConversationMessage[];
  onClear: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationHistory({ messages, onClear }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll container to bottom whenever messages grow
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <section className="conv-root" aria-label="Conversation history">
      <div className="conv-header">
        <span className="conv-title">💬 Conversation</span>
        <button className="conv-clear-btn" onClick={onClear} aria-label="Clear conversation history">
          Clear history
        </button>
      </div>

      <div className="conv-scroll" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`conv-row conv-row--${msg.role}`}>
            <div className={`conv-bubble conv-bubble--${msg.role}`}>
              <div className="conv-content">
                {msg.content.split(/\n\n+/).map((para, j) => (
                  <p key={j} className="conv-para">{para}</p>
                ))}
              </div>
              <time className="conv-ts" dateTime={new Date(msg.timestamp).toISOString()}>
                {formatTime(msg.timestamp)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
