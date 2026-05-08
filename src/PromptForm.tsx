import React, { useState } from "react";
import "./PromptForm.css";
import VitaminDCard from "./VitaminDCard";
import SkeletonWeatherCard from "./components/SkeletonWeatherCard";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DONKEY_ERRORS = [
  "Well, this is embarrassing. My weather magic fizzled. Try again. 🌧️",
  "I looked outside and saw nothing. Literally nothing. One more try?",
  "The clouds are unresponsive today. Just like my ex. Try once more? ☁️",
  "Something broke. Shocking, I know. Hit that button again and act surprised. 💀",
  "My crystal ball is buffering. This is fine. Totally fine. Try again? 🔮",
  "Error 404: Weather not found. The forecast ghosted us. Again? 👻",
  "I consulted the atmosphere and it said 'not now'. Rude. Retry? 🙄",
  "The forecast API went for an unscheduled smoke break. Try again.",
  "My meteorological instincts misfired spectacularly. Once more? 🎯",
  "Even I have bad days. This is one of them. One more shot?",
];

function randomDonkeyError(): string {
  return DONKEY_ERRORS[Math.floor(Math.random() * DONKEY_ERRORS.length)];
}

const CHIPS = [
  { label: "☂️ Need an umbrella?", prompt: "Do I need an umbrella today?" },
  { label: "👔 What should I wear?", prompt: "What should I wear today based on the weather?" },
  { label: "💨 Air quality check", prompt: "How's the air quality right now?" },
  { label: "🌅 Best time to go outside", prompt: "What's the best time to go outside today?" },
  { label: "🌡️ Feels-like vs actual", prompt: "How does the feels-like temperature compare to the actual temperature right now?" },
] as const;

interface PromptFormProps {
  location?: { lat: number; lon: number } | null;
  cityName?: string | null;
  selectedTone: string;
  sessionId?: string | null;
  onLoadingChange?: (loading: boolean) => void;
  onPromptStart?: (userText: string) => void;
  onStreamUpdate?: (assistantText: string) => void;
  onPromptComplete?: (userText: string, assistantText: string) => void;
  onPromptError?: (message: string, requestId?: string) => void;
  onWeatherData?: (result: any) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  location = null,
  cityName = null,
  selectedTone,
  sessionId = null,
  onLoadingChange,
  onPromptStart,
  onStreamUpdate,
  onPromptComplete,
  onPromptError,
  onWeatherData,
}) => {
  const [input, setInput] = useState<string>("");
  const [streamText, setStreamText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorReqId, setErrorReqId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const submitPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setStreamText("");
    setErrorMessage("");
    setErrorReqId(null);
    onLoadingChange?.(true);
    onPromptStart?.(trimmed);

    const payload: Record<string, unknown> = {
      prompt: trimmed,
      tone: selectedTone,
    };
    if (location) payload.location = location;
    if (sessionId) payload.session_id = sessionId;

    const controller = new AbortController();
    const timeoutMs = 75000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    let reqId: string | null = null;

    try {
      const res = await fetch(`${BASE_URL}/prompt/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      reqId = res.headers.get("X-Request-ID");
      if (reqId) console.log(`🔑 [${reqId}] /prompt/stream connected`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const apiErr = {
          error: errData.error || `HTTP ${res.status}`,
          code: errData.code,
          request_id: reqId ?? errData.request_id,
        };
        if (apiErr.request_id) setErrorReqId(apiErr.request_id);
        throw apiErr;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let currentEvent = "message";
      let sawDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.replace(/\r$/, "");

          if (line === "") {
            currentEvent = "message";
            continue;
          }

          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim() || "message";
            continue;
          }

          if (!line.startsWith("data: ")) continue;

          const token = line.slice(6);

          if (currentEvent === "meta") {
            try {
              const meta = JSON.parse(token);
              if (meta.request_id) console.log(`🔑 [${meta.request_id}] stream metadata received`);
            } catch {
              // Metadata should never become visible response text.
            }
            continue;
          }

          if (currentEvent === "weather") {
            try {
              const weatherPayload = JSON.parse(token);
              onWeatherData?.(weatherPayload);
            } catch (err) {
              console.warn("Failed to parse weather SSE payload", err);
            }
            continue;
          }

          if (currentEvent === "error") {
            let streamError: any = { error: "Stream failed", request_id: reqId };
            try {
              streamError = { ...streamError, ...JSON.parse(token) };
            } catch {
              streamError.error = token;
            }
            throw streamError;
          }

          if (token === "[DONE]") {
            sawDone = true;
            onPromptComplete?.(trimmed, accumulated);
            continue;
          }

          const unescaped = token.replace(/\\n/g, "\n");
          accumulated += unescaped;
          setStreamText(accumulated);
          onStreamUpdate?.(accumulated);
        }
      }
      if (!sawDone) {
        if (accumulated.trim()) {
          console.warn("Stream ended without [DONE]; completing with accumulated text.");
          onPromptComplete?.(trimmed, accumulated);
        } else {
          throw { error: "Stream ended before the donkey said anything useful.", request_id: reqId };
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        const friendly = "The donkey stared at the sky too long and timed out. Try again.";
        setErrorMessage(friendly);
        onPromptError?.(friendly, reqId ?? undefined);
      } else {
        console.error("Error fetching weather:", err.error ?? err.message ?? err);
        if (err.request_id) setErrorReqId(err.request_id);
        const friendly = randomDonkeyError();
        setErrorMessage(friendly);
        onPromptError?.(friendly, err.request_id);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitPrompt(input.trim());
  };

  const handleChip = (prompt: string) => {
    setInput(prompt);
    submitPrompt(prompt);
  };

  return (
    <div className="prompt-wrapper">
      {cityName && (
        <div className="location-badge" id="prompt-location-badge">
          📍 {cityName}
        </div>
      )}

      {!input && (
        <div className="chips-row" aria-label="Quick questions">
          {CHIPS.map(({ label, prompt }) => (
            <button
              key={label}
              type="button"
              className="chip"
              onClick={() => handleChip(prompt)}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          type="text"
          className="prompt-input"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Ask the Donkey..."
          disabled={loading}
          aria-describedby={cityName ? "prompt-location-badge" : undefined}
        />
        <button type="submit" className="prompt-button" disabled={loading}>
          {loading ? "⏳" : "Send"}
        </button>
      </form>

      {loading && !streamText && !errorMessage && (
        <SkeletonWeatherCard label="Loading donkey response" />
      )}

      {errorMessage && (
        <div className="error-banner" role="alert">
          ⚠️ {errorMessage}
          {errorReqId && (
            <span className="error-req-id"> · Debug ID: {errorReqId.slice(0, 8)}</span>
          )}
        </div>
      )}

      <VitaminDCard location={location} sessionId={sessionId} />
    </div>
  );
};

export default PromptForm;
