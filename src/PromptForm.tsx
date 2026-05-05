// PromptForm.tsx
import React, { useState } from "react";
import "./PromptForm.css";
import ToneSelector from "./ToneSelector";
import WeatherIndicators from "./WeatherIndicators";
import VitaminDCard from "./VitaminDCard";

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
  setSelectedTone: (tone: string) => void;
  sessionId?: string | null;
  onWeatherResult?: (result: any) => void;
  onConversationTurn?: (userText: string, assistantText: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  location = null,
  cityName = null,
  selectedTone,
  setSelectedTone,
  sessionId = null,
  onWeatherResult,
  onConversationTurn,
  onLoadingChange,
}) => {
  const [input, setInput] = useState<string>("");
  const [weatherResult, setWeatherResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const submitPrompt = async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    onLoadingChange?.(true);
    setErrorMessage("");
    setWeatherResult(null);

    const payload: Record<string, any> = {
      prompt: text.trim(),
      tone: selectedTone,
    };
    if (location)  payload.location   = location;
    if (sessionId) payload.session_id = sessionId;

    try {
      const res = await fetch(`${BASE_URL}/prompt/structured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      setWeatherResult(data);
      if (onWeatherResult) onWeatherResult(data);
      onConversationTurn?.(text.trim(), data.text_summary || data.summary || "");
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setErrorMessage(randomDonkeyError());
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
        </div>
      )}

      {weatherResult && (
        <div className="weather-response">
          {weatherResult.metadata?.location && (
            <p className="response-location">
              📍 {weatherResult.metadata.location}
            </p>
          )}

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
