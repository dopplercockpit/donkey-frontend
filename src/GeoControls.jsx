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

function looksPostalOnly(value) {
  const trimmed = value.trim();

  // Numeric-only postal/ZIP codes are globally ambiguous.
  if (/^\d{3,10}$/.test(trimmed)) return true;

  // Very short alphanumeric postal-like strings without spaces are also risky.
  // Keep this conservative so normal city names are not blocked.
  if (/^[a-zA-Z]\d[a-zA-Z]\d[a-zA-Z]\d$/.test(trimmed)) return true;

  return false;
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
  const [manualOpen, setManualOpen] = useState(false);
  const [localManualError, setLocalManualError] = useState("");
  const statusLabel = useMemo(() => {
    if (geoStatus === "denied") return pick(GEO_DENIED_MESSAGES);
    if (geoStatus === "error") return pick(GEO_ERROR_MESSAGES);
    return STATIC_LABELS[geoStatus] ?? null;
  }, [geoStatus]);

  const shouldShowManualForm =
    manualOpen ||
    geoStatus === "denied" ||
    geoStatus === "error" ||
    geoStatus === "disabled" ||
    geoStatus === "unavailable" ||
    !cityName;
  const visibleManualError = localManualError || manualLocationError;

  const handleManualSubmit = (event) => {
    event.preventDefault();
    const trimmed = manualQuery.trim();
    setLocalManualError("");
    if (!trimmed || manualLocationLoading) return;

    if (looksPostalOnly(trimmed)) {
      setLocalManualError(
        "Postal codes alone are ambiguous. Add city or country, like 'Lyon 69001' or '49880 USA'."
      );
      return;
    }

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
      <button
        type="button"
        className="geo-btn geo-btn--manual"
        onClick={() => setManualOpen((open) => !open)}
        aria-expanded={shouldShowManualForm}
      >
        {shouldShowManualForm ? "Hide manual location" : "Change location manually"}
      </button>
      {shouldShowManualForm && (
        <form className="manual-location-form" onSubmit={handleManualSubmit}>
          <span className="manual-location-hint">
            Blocked GPS? Use city + country/region. Postal codes alone can send me to Narnia.
          </span>
          <div className="manual-location-row">
            <input
              type="text"
              className="manual-location-input"
              value={manualQuery}
              onChange={(event) => {
                setManualQuery(event.target.value);
                if (localManualError) setLocalManualError("");
              }}
              placeholder="Lyon 69001, France"
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
          <span className="manual-location-examples">
            Try: Lyon 69001 · 69004 France · Detroit MI · 49880 USA
          </span>
          {visibleManualError && (
            <div className="manual-location-error" role="alert">
              {visibleManualError}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
