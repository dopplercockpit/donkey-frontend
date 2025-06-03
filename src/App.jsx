import React, { useState, useEffect } from 'react';
import PromptForm from './PromptForm';
import './App.css';
import donkeyLogo from './assets/mister_donkey_logo.png'; // You must place your logo image in src/assets and name it accordingly

function App() {
  const [location, setLocation] = useState(null);

  const donkeyTaglines = [
    "I check the sky so you don't have to read numbers.",
    "Helping you avoid soggy socks and nasty little sunburns.",
    "Forecasts so accurate, you’ll think I'm dating Mother Nature.",
    "Sun? Snow? Sleet? The Sky? I’ll tell you what’s falling, and when to run.",
    "If you walk outside dressed wrong, it’s no longer your fault.",
    "For people who hate guessing the weather... and wearing pants.",
    "Science, clouds, data, a jackass, and a whole lotta love.",
    "I'm the reason you won’t need to look out the window.",
    "Weather so clear, you can stop watching the news.",
    "I'm like a cursed meteorological horcrux, but in the best possible way 🌦️💀",
    "Give ‘em the storm before they ask for it.",
    "I check the weather, before you ask.",
    "Voulez-vous un peu de pluie avec ça? Ce soir?",
    "Smarter than your phone, and way less toxic.",
    "GPT-Powered Weather Alerts with Profanity",
  ];
  
  const randomTagline = donkeyTaglines[Math.floor(Math.random() * donkeyTaglines.length)];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocation(null);
        }
      );
    }
  }, []);

  // 💡 The actual render part
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

          <PromptForm location={location} />
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
