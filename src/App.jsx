import React, { useState, useEffect, useCallback } from 'react';
import PromptForm from './PromptForm';
import GeoControls from './GeoControls';
import SupportCard from './SupportCard';
import ConversationHistory from './ConversationHistory';
import './App.css';
import donkeyLogo from './assets/mister_donkey_logo.png';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const donkeyTaglines = [
  "I check the sky so you don't have to read numbers.",
  "Helping you avoid soggy socks and nasty little sunburns.",
  "Forecasts so accurate, you'll think I'm dating Mother Nature.",
  "Sun? Snow? Sleet? The Sky? I'll tell you what's falling, and when to run.",
  "If you walk outside dressed wrong, it's no longer your fault.",
  "For people who hate guessing the weather... and wearing pants.",
  "Science, clouds, data, a jackass, and a whole lotta love.",
  "I'm the reason you won't need to look out the window.",
  "Weather so clear, you can stop watching the news.",
  "I'm like a cursed meteorological horcrux, but in the best possible way 🌦️💀",
  "Give 'em the storm before they ask for it.",
  "I check the weather, before you ask.",
  "Voulez-vous un peu de pluie avec ça? Ce soir?",
  "Smarter than your phone, and way less toxic.",
  "GPT-Powered Weather Alerts with a little profanity",
];

function App() {
  // Geolocation state
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle|requesting|granted|denied|error|disabled
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState(null);

  // Session state
  const [sessionId, setSessionId] = useState(null);

  // Personality state (lifted here so it persists across requests)
  const [selectedTone, setSelectedTone] = useState("sarcastic");

  // Auto-loaded weather result
  const [autoWeatherResult, setAutoWeatherResult] = useState(null);
  const [autoWeatherLoading, setAutoWeatherLoading] = useState(false);
  const [showAutoWeather, setShowAutoWeather] = useState(true);

  // PromptForm loading signal — lifted here only to drive the logo animation
  const [promptLoading, setPromptLoading] = useState(false);

  // Conversation history — populated by explicit user prompts only (not auto-load)
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleConversationTurn = useCallback((userText, assistantText) => {
    const now = Date.now();
    setConversationHistory(prev => [
      ...prev,
      { role: "user",      content: userText,     timestamp: now },
      { role: "assistant", content: assistantText, timestamp: now },
    ]);
  }, []);

  const randomTagline = donkeyTaglines[Math.floor(Math.random() * donkeyTaglines.length)];

  // 1) Session ID — create or restore from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mister_donkey_session_id");
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("mister_donkey_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  // 2) Geolocation — single source of truth
  const requestGeolocation = useCallback(() => {
    if (!geoEnabled) {
      setGeoStatus("disabled");
      return;
    }
    if (!("geolocation" in navigator)) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });
        setGeoStatus("granted");

        // Reverse geocode to get city name
        fetch(`${BASE_URL}/geo/reverse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.city) {
              setCityName(data.city);
            } else {
              console.warn("⚠️ Could not determine city");
            }
          })
          .catch((err) => {
            console.error("🛑 Reverse geocoding failed:", err);
          });
      },
      (err) => {
        console.warn("🛑 Geolocation error:", err);
        setGeoStatus(err.code === 1 ? "denied" : "error");
        setLocation(null);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [geoEnabled]);

  // Trigger geolocation once on mount (if enabled)
  useEffect(() => {
    if (geoEnabled) {
      requestGeolocation();
    } else {
      setGeoStatus("disabled");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Auto-weather fetch — fires once after location + city + session are ready
  const fetchAutoWeather = useCallback(async (loc, city, tone, sid) => {
    setAutoWeatherLoading(true);
    setShowAutoWeather(true);
    try {
      const res = await fetch(`${BASE_URL}/prompt/structured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Hey Mister Donkey, what's the weather right now in ${city}?`,
          location: loc,
          tone,
          session_id: sid,
          auto: true,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAutoWeatherResult(data);
    } catch (err) {
      console.error("🐴 Auto weather fetch failed:", err);
    } finally {
      setAutoWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (geoStatus === "granted" && location && cityName && sessionId) {
      fetchAutoWeather(location, cityName, selectedTone, sessionId);
    }
  }, [geoStatus, cityName, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeoToggle = () => {
    const next = !geoEnabled;
    setGeoEnabled(next);
    if (!next) {
      setGeoStatus("disabled");
      setLocation(null);
      setCityName(null);
    } else {
      requestGeolocation();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="sidebar ad-left">
        <SupportCard />
      </div>

      <div className="main-content">
        <div className="app-container">
          <img
            src={donkeyLogo}
            alt="Mister Donkey Logo"
            className={`logo${(autoWeatherLoading || promptLoading) ? ' loading' : ''}`}
          />
          <h1 className="title">weather from a jackass ❄️☀️</h1>
          <p className="subtitle">{randomTagline}</p>

          <GeoControls
            geoStatus={geoStatus}
            geoEnabled={geoEnabled}
            cityName={cityName}
            onRetry={requestGeolocation}
            onToggle={handleGeoToggle}
          />

          {/* Auto-loaded weather result */}
          {autoWeatherLoading && (
            <div className="auto-weather-loading">
              🐴 Sniffing the air...
            </div>
          )}
          {showAutoWeather && autoWeatherResult && !autoWeatherLoading && (
            <div className="auto-weather-card">
              <button
                className="auto-weather-dismiss"
                onClick={() => setShowAutoWeather(false)}
                aria-label="Dismiss"
              >
                ×
              </button>
              <h3 className="auto-weather-title">🐴 Mister Donkey's Auto-Sniff Report</h3>
              <div className="auto-weather-content">
                {autoWeatherResult.text_summary
                  ? autoWeatherResult.text_summary.split(/\n\n+/).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  : autoWeatherResult.summary || "Weather data loaded!"}
              </div>
            </div>
          )}

          <ConversationHistory
            messages={conversationHistory}
            onClear={() => setConversationHistory([])}
          />

          <PromptForm
            location={location}
            cityName={cityName}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            sessionId={sessionId}
            onWeatherResult={setAutoWeatherResult}
            onConversationTurn={handleConversationTurn}
            onLoadingChange={setPromptLoading}
          />
        </div>

        <footer className="footer">
          Made by Doppler / Edward • <em>Powered by Mister Donkey</em>
        </footer>
      </div>

      <div className="sidebar ad-right">
        <div className="sponsor-slot">
          🌦️ Sponsor slot — coming soon
        </div>
      </div>
    </div>
  );
}

export default App;
