import React from 'react';
import './GeoControls.css';

const STATUS_LABELS = {
  idle: null,
  requesting: "📡 Locating you...",
  granted: null, // city name shown elsewhere
  denied: "📵 Location denied",
  error: "⚠️ Location error",
  disabled: "📍 Location off",
  unavailable: "📍 Location unavailable",
};

export default function GeoControls({ geoStatus, geoEnabled, cityName, onRetry, onToggle }) {
  const statusLabel = STATUS_LABELS[geoStatus] ?? null;

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
