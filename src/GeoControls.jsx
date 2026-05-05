import React, { useMemo } from 'react';
import './GeoControls.css';

const GEO_DENIED_MESSAGES = [
  "📵 You won't tell me where you are. Bold move. Type a city or let me in.",
  "🙈 Location denied. Flying completely blind over here. City name? Anything?",
  "🗺️ You're off my map. Literally. Share location or type a city.",
  "🕵️ I'm a donkey, not a psychic. Give me something to work with.",
  "🚫 Location blocked. I respect the privacy. I resent the mystery. Type a city.",
];

const GEO_ERROR_MESSAGES = [
  "⚠️ GPS blew up. Unannounced. Classic.",
  "⚠️ Location errored out spectacularly. Try again.",
  "⚠️ Something broke in the navigation department. Retry?",
];

const STATIC_LABELS = {
  idle:        null,
  requesting:  "📡 Locating you...",
  granted:     null,
  disabled:    "📍 Location off",
  unavailable: "📍 Location unavailable",
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function GeoControls({ geoStatus, geoEnabled, cityName, onRetry, onToggle }) {
  const statusLabel = useMemo(() => {
    if (geoStatus === "denied") return pick(GEO_DENIED_MESSAGES);
    if (geoStatus === "error")  return pick(GEO_ERROR_MESSAGES);
    return STATIC_LABELS[geoStatus] ?? null;
  }, [geoStatus]); // re-picks whenever status changes, stays stable between re-renders

  return (
    <div className="geo-controls">
      {cityName && geoStatus === "granted" && (
        <span className="geo-city">📍 {cityName}</span>
      )}
      {statusLabel && (
        <span className={`geo-status geo-status--${geoStatus}`}>{statusLabel}</span>
      )}
      <div className="geo-actions">
        {(geoStatus === "denied" || geoStatus === "error") && (
          <button type="button" className="geo-btn geo-btn--retry" onClick={onRetry}>
            Retry location
          </button>
        )}
        <button
          type="button"
          className={`geo-btn geo-btn--toggle ${!geoEnabled ? 'geo-btn--off' : ''}`}
          onClick={onToggle}
        >
          {geoEnabled ? "Disable location" : "Enable location"}
        </button>
      </div>
    </div>
  );
}
