// PromptForm.tsx
import React, { useState } from "react";
import "./PromptForm.css";
import ToneSelector from "./ToneSelector";
import WeatherIndicators from "./WeatherIndicators";
import VitaminDCard from "./VitaminDCard";
import ShareButton from "./ShareButton";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DONKEY_ERRORS = [
  "Well, this is embarrassing. My weather magic fizzled. Try again. 🌧️",
  "I looked outside and saw nothing. Literally nothing. One more try? 🫥",
  "The clouds are unresponsive today. Just like my ex. Try once more? ☁️",
  "Something broke. Shocking, I know. Hit that button again and act surprised. 💀",
  "My crystal ball is buffering. This is fine. Totally fine. Try again? 🔮",
  "Error 404: Weather not found. The forecast ghosted us. Again? 👻",
  "I consulted the atmosphere and it said 'not now'. Rude. Retry? 🙄",
  "The forecast API went for an unscheduled smoke break. Try again. 🚬",
  "My meteorological instincts misfired spectacularly. Once more? 🎯",
  "Even I have bad days. This is one of them. One more shot? 🫠",
];

function randomDonkeyError(): string {
  return DONKEY_ERRORS[Math.floor(Math.random() * DONKEY_ERRORS.length)];
}

const CHIPS = [
  { label: "🌂 Need an umbrella?",        prompt: "Do I need an umbrella today?" },
  { label: "👔 What should I wear?",      prompt: "What should I wear today based on the weather?" },
  { label: "💨 Air quality check",         prompt: "How's the air quality right now?" },
  { label: "🌅 Best time to go outside",  prompt: "What's the best time to go outside today?" },
  { label: "🌡️ Feels-like vs actual",    prompt: "How does the feels-like temperature compare to the actual temperature right now?" },
] as const;

interface PromptFormProps {
  location?: { lat: number; lon: number } | null;
  cityName?: string | null;
  selectedTone: string;
  setSelectedTone?: (tone: string) => void;
  sessionId?: string | null;
  onWeatherResult?: (result: any) => void;
  onConversationTurn?: (userText: string, assistantText: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  location = null,
  cityName = null,
  selectedTone,
  setSelectedTone = () => {},
  sessionId = null,
  onWeatherResult,
  onConversationTurn,
  onLoadingChange,
}) => {
  const [input, setInput] = useState<string>("");
  const [weatherResult, setWeatherResult] = useState<any | null>(null);
  const [streamText, setStreamText] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorReqId, setErrorReqId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const submitPrompt = async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    setStreaming(true);
    setStreamText("");
    onLoadingChange?.(true);
    setErrorMessage("");
    setErrorReqId(null);
    setWeatherResult(null);

    const payload: Record<string, any> = {
      prompt: text.trim(),
      tone: selectedTone,
    };
    if (location)  payload.location   = location;
    if (sessionId) payload.session_id = sessionId;

    try {
      const res = await fetch(`${BASE_URL}/prompt/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const reqId = res.headers.get("X-Request-ID");
      if (reqId) console.log(`🔑 [${reqId}] /prompt/stream connected`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const apiErr = { error: errData.error || `HTTP ${res.status}`, code: errData.code, request_id: reqId ?? errData.request_id };
        if (apiErr.request_id) setErrorReqId(apiErr.request_id);
        throw apiErr;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6);
            if (token === "[DONE]") {
              // Stream finished — promote to weatherResult
              const synth = { text_summary: accumulated, summary: accumulated };
              setWeatherResult(synth);
              if (onWeatherResult) onWeatherResult(synth);
              onConversationTurn?.(text.trim(), accumulated);
              setStreaming(false);
            } else {
              const unescaped = token.replace(/\\n/g, "\n");
              accumulated += unescaped;
              setStreamText(accumulated);
            }
          } else if (line.startsWith("event: error")) {
            // next data line will have the error JSON — handled next iteration
          } else if (line.startsWith("data: ") === false && line.includes('"error"')) {
            try {
              const errObj = JSON.parse(line.replace(/^data:\s*/, ""));
              throw { error: errObj.error, request_id: reqId };
            } catch { /* ignore parse failures */ }
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching weather:", err.error ?? err.message ?? err);
      if (err.request_id) setErrorReqId(err.request_id);
      setErrorMessage(randomDonkeyError());
      setStreaming(false);
    } finally {
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
      <ToneSelector selectedTone={selectedTone} onToneChange={setSelectedTone} />

      {cityName && (
        <div className="location-badge">
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
        />
        <button type="submit" className="prompt-button" disabled={loading}>
          {loading ? "⏳" : "Send"}
        </button>
      </form>

      {errorMessage && (
        <div className="error-banner" role="alert">
          ⚠️ {errorMessage}
          {errorReqId && (
            <span className="error-req-id"> · ID: {errorReqId.slice(0, 8)}</span>
          )}
        </div>
      )}

      {/* Streaming response — shown while tokens are arriving */}
      {streaming && (
        <div className="weather-response stream-active">
          <div className="response-summary">
            {streamText.split(/\n\n+/).map((para, i) => (
              <p key={i} className="summary-para">{para}</p>
            ))}
            <span className="stream-cursor" aria-hidden="true">▋</span>
          </div>
        </div>
      )}

      {/* Completed response — shown once stream finishes */}
      {!streaming && weatherResult && (
        <div className="weather-response">
          <div className="response-header">
            {weatherResult.metadata?.location && (
              <p className="response-location">
                📍 {weatherResult.metadata.location}
              </p>
            )}
            {weatherResult.text_summary && (
              <ShareButton textSummary={weatherResult.text_summary} />
            )}
          </div>

          <div className="response-summary">
            {weatherResult.text_summary
              ? weatherResult.text_summary.split(/\n\n+/).map((para: string, i: number) => (
                  <p key={i} className="summary-para">{para}</p>
                ))
              : weatherResult.summary && (
                  <p className="summary-para">{weatherResult.summary}</p>
                )}
          </div>

          {weatherResult.weather && (
            <WeatherIndicators weather={weatherResult.weather} />
          )}
        </div>
      )}

      <VitaminDCard location={location} sessionId={sessionId} />
    </div>
  );
};

export default PromptForm;
