// PromptForm.tsx
import React, { useState, useEffect } from "react";
import "./PromptForm.css";
import ToneSelector from "./ToneSelector";

interface PromptFormProps {
  location?: { lat: number; lon: number } | null;
  cityName?: string | null;
}

const PromptForm: React.FC<PromptFormProps> = ({ location = null, cityName = null }) => {
  const [input, setInput] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [response, setResponse] = useState<string>("");
  const [locationConfirmed, setLocationConfirmed] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<string>("sarcastic");

  // Whenever the parent (App.jsx) passes a new `location` prop, update local lat/lon
  useEffect(() => {
    if (location && location.lat != null && location.lon != null) {
      setLatitude(location.lat);
      setLongitude(location.lon);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Record<string, any> = {
      prompt: input.trim(),
      tone: selectedTone
    };
    if (latitude !== null && longitude !== null) {
      payload.location = { lat: latitude, lon: longitude };
    }

    try {
      // Ensure VITE_API_URL is set in your .env (e.g. "https://weatherjackass.com")
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseURL}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data.summary || data.error || "No response received.");
    } catch (error) {
      console.error("Error fetching weather:", error);
      setResponse("There was an error fetching the weather. Try again.");
    }
  };

  return (
    <div className="prompt-wrapper">
      <ToneSelector selectedTone={selectedTone} onToneChange={setSelectedTone} />
      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          type="text"
          className="prompt-input"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Ask the Donkey..."
        />
        <button type="submit" className="prompt-button">
          Send
        </button>

        {!locationConfirmed && (latitude !== null && longitude !== null) && (
          <div className="location-info">
            <span role="img" aria-label="compass">🧭</span>{" "}
            Mister Donkey thinks you're around{" "}
            {cityName ? (
              <strong>{cityName}</strong>
            ) : (
              <span>({latitude.toFixed(2)}, {longitude.toFixed(2)})</span>
            )}

            <button
              type="button"
              onClick={() => setLocationConfirmed(true)}
              style={{ marginLeft: "0.5rem", cursor: "pointer" }}
            >
              Yep, that's right
            </button>
          </div>
        )}
      </form>

      {response && (
        <div className="response" style={{ marginTop: "1rem" }}>
          🧠 {response}
        </div>
      )}
    </div>
  );
};

export default PromptForm;