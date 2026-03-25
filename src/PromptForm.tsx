// PromptForm.tsx
import React, { useState } from "react";
import "./PromptForm.css";
import ToneSelector from "./ToneSelector";
import WeatherIndicators from "./WeatherIndicators";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface PromptFormProps {
  location?: { lat: number; lon: number } | null;
  cityName?: string | null;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  sessionId?: string | null;
  onWeatherResult?: (result: any) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  location = null,
  cityName = null,
  selectedTone,
  setSelectedTone,
  sessionId = null,
  onWeatherResult,
}) => {
  const [input, setInput] = useState<string>("");
  const [weatherResult, setWeatherResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setWeatherResult(null);

    const payload: Record<string, any> = {
      prompt: input.trim(),
      tone: selectedTone,
    };
    if (location) {
      payload.location = location;
    }
    if (sessionId) {
      payload.session_id = sessionId;
    }

    try {
      const res = await fetch(`${BASE_URL}/prompt/structured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setWeatherResult(data);
      if (onWeatherResult) onWeatherResult(data);
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setErrorMessage(
        "Failed to get weather. Please try again. If this keeps happening, contact support at sysop@doppleredward.com."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-wrapper">
      <ToneSelector selectedTone={selectedTone} onToneChange={setSelectedTone} />

      {cityName && (
        <div className="location-badge">
          📍 {cityName}
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
    </div>
  );
};

export default PromptForm;
