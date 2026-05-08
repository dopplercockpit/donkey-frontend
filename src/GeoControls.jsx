import React, { useMemo, useState } from 'react';
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
  idle: null,
  requesting: "📡 Locating you...",
  granted: null,
  manual: "📍 Manual location",
  disabled: "📍 Location off",
  unavailable: "📍 Location unavailable",
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function GeoControls({
  geoStatus,
  geoEnabled,
  cityName,
  onRetry,
  onToggle,
  onManualLocationSubmit,
  manualLocationLoading = false,
  manualLocationError = "",
}) {
  const [manualQuery, setManualQuery] = useState("");
  const statusLabel = useMemo(() => {
    if (geoStatus === "denied") return pick(GEO_DENIED_MESSAGES);
    if (geoStatus === "error") return pick(GEO_ERROR_MESSAGES);
    return STATIC_LABELS[geoStatus] ?? null;
  }, [geoStatus]);

  const handleManualSubmit = (event) => {
    event.preventDefault();
    const trimmed = manualQuery.trim();
    if (!trimmed || manualLocationLoading) return;
    onManualLocationSubmit?.(trimmed);
  };

  return (
    <div className="geo-controls">
      <div className="geo-status-region" role="status" aria-live="polite">
        {cityName && (geoStatus === "granted" || geoStatus === "manual") && (
          <span className="geo-city">📍 {cityName}</span>
        )}
        {statusLabel && (
          <span className={`geo-status geo-status--${geoStatus}`}>{statusLabel}</span>
        )}
      </div>
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
          aria-pressed={geoEnabled}
          aria-label={geoEnabled ? "Disable location sharing" : "Enable location sharing"}
        >
          {geoEnabled ? "Disable location" : "Enable location"}
        </button>
      </div>
      <form className="manual-location-form" onSubmit={handleManualSubmit}>
        <span className="manual-location-hint">
          Blocked GPS? Type a city or ZIP. I&apos;m a donkey, not a psychic.
        </span>
        <div className="manual-location-row">
          <input
            type="text"
            className="manual-location-input"
            value={manualQuery}
            onChange={(event) => setManualQuery(event.target.value)}
            placeholder="City, ZIP, or postal code"
            aria-label="Manual location"
            disabled={manualLocationLoading}
          />
          <button
            type="submit"
            className="manual-location-submit"
            disabled={manualLocationLoading || manualQuery.trim().length < 2}
          >
            {manualLocationLoading ? "Finding..." : "Use location"}
          </button>
        </div>
        {manualLocationError && (
          <div className="manual-location-error" role="alert">
            {manualLocationError}
          </div>
        )}
      </form>
    </div>
  );
}
