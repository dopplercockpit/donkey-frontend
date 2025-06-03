// PromptForm.tsx
import React, { useState, useEffect } from "react";
import "./PromptForm.css";

interface PromptFormProps {
  location?: { lat: number; lon: number } | null;
}

const PromptForm: React.FC<PromptFormProps> = ({ location = null }) => {
  const [input, setInput] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [response, setResponse] = useState<string>("");
  const [locationConfirmed, setLocationConfirmed] = useState<boolean>(false);

  // Whenever the parent (App.jsx) passes a new `location` prop, update local lat/lon
  useEffect(() => {
    if (location && location.lat != null && location.lon != null) {
      setLatitude(location.lat);
      setLongitude(location.lon);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Record<string, any> = { prompt: input.trim() };
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

        {latitude !== null && longitude !== null && !locationConfirmed && (
          <div className="location-info">
            <span role="img" aria-label="compass">
              🧭
            </span>{" "}
            Donkey thinks you're around ({latitude.toFixed(2)}, {longitude.toFixed(2)})
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
