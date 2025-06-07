import React, { useState, useEffect } from 'react';
import PromptForm from './PromptForm';
import AutoWeatherLoader from './AutoWeatherLoader.jsx';
import './App.css';
import donkeyLogo from './assets/mister_donkey_logo.png';

function App() {
  const [location, setLocation] = useState(null);
  const [autoWeatherResult, setAutoWeatherResult] = useState(null); // State for auto-loaded weather
  const [showAutoWeather, setShowAutoWeather] = useState(false); // Control auto weather display

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
  
  const [cityName, setCityName] = useState(null);

  const randomTagline = donkeyTaglines[Math.floor(Math.random() * donkeyTaglines.length)];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });

          // Reverse geocode to get city name
          const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
          fetch(`${baseURL}/geo/reverse`, {
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
            .catch((error) => {
              console.error("🛑 Reverse geocoding failed:", error);
            });
        },
        (error) => {
          console.warn("🛑 Geolocation error:", error);
          setLocation(null);
        }
      );
    }
  }, []);

  // Handle auto weather result
  useEffect(() => {
    if (autoWeatherResult) {
      setShowAutoWeather(true);
      // Auto-hide after 10 seconds (optional)
      const timer = setTimeout(() => {
        setShowAutoWeather(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [autoWeatherResult]);

  return (
    <div className="page-wrapper">
      <div className="sidebar ad-left">
        <div className="ad-box">☕ Ad Space – Buy the Donkey a Coffee</div>
      </div>

      <div className="main-content">
        <div className="app-container" style={{ textAlign: 'center', padding: '1rem' }}>
          <img
            src={donkeyLogo}
            alt="Mister Donkey Logo"
            style={{ maxWidth: '200px', marginBottom: '1rem' }}
          />
          <h1 className="title">weather from a jackass ❄️☀️</h1>
          <p className="subtitle">{randomTagline}</p>
          {cityName && (
            <p className="subtitle">
              📍 Detected location: <strong>{cityName}</strong>
            </p>
          )}

          {/* Auto Weather Display */}
          {showAutoWeather && autoWeatherResult && (
            <div className="auto-weather-card" style={{
              backgroundColor: '#f0f8ff',
              border: '2px solid #4a90e2',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowAutoWeather(false)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                🐴 Mister Donkey's Auto-Sniff Report
              </h3>
              <div className="auto-weather-content" style={{ 
                textAlign: 'left',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {autoWeatherResult.summary || autoWeatherResult.text || 'Weather data loaded!'}
              </div>
            </div>
          )}

          {/* Auto Weather Loader Component */}
          <AutoWeatherLoader setAutoWeatherResult={setAutoWeatherResult} />

          {/* Regular Prompt Form */}
          <PromptForm location={location} cityName={cityName} />
        </div>

        <footer className="footer">
          Made by Doppler / Edward • <em>Powered by Mister Donkey</em>
        </footer>
      </div>

      <div className="sidebar ad-right">
        <div className="ad-box">🌦️ This forecast is brought to you by... money</div>
      </div>
    </div>
  );
}

export default App;