import React, { useState } from "react";
import "./VitaminDCard.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SKIN_TYPES = [
  { type: 1, label: "I",   swatch: "#F5D5B8", text: "#5C3317", desc: "Very Fair"  },
  { type: 2, label: "II",  swatch: "#E8B896", text: "#5C3317", desc: "Fair"       },
  { type: 3, label: "III", swatch: "#C68642", text: "#fff",    desc: "Medium"     },
  { type: 4, label: "IV",  swatch: "#8D5524", text: "#fff",    desc: "Olive"      },
  { type: 5, label: "V",   swatch: "#5C3317", text: "#ffe0c0", desc: "Brown"      },
  { type: 6, label: "VI",  swatch: "#2D1600", text: "#ffe0c0", desc: "Dark"       },
] as const;

function indexColor(idx: number): string {
  if (idx >= 8) return "#4caf74";
  if (idx >= 5) return "#f0c040";
  if (idx >= 2) return "#e8834a";
  return "#6b7a8d";
}

interface VDResult {
  vitamin_d_index: number;
  synthesis_minutes: number | null;
  recommendation: string;
  uv_index: number;
  sun_elevation: number;
  cloud_factor: number;
  skin_type_label: string;
  cloud_cover_pct: number;
  protection_after_minutes?: number | null;
  sun_safety_note?: string;
  exposure_window_label?: string;
  day_phase?: string;
}

interface VitaminDCardProps {
  location: { lat: number; lon: number } | null;
  sessionId?: string | null;
}

export default function VitaminDCard({ location, sessionId }: VitaminDCardProps) {
  const [skinType, setSkinType] = useState(3);
  const [result, setResult]     = useState<VDResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const selected = SKIN_TYPES[skinType - 1];

  const handleFetch = async () => {
    if (!location) {
      setError("Enable location to get your Vitamin D forecast.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/vitamin-d`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          skin_type: skinType,
          session_id: sessionId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Vitamin D forecast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vitd-card">
      <div className="vitd-header">
        <span className="vitd-title">☀️ Vitamin D Forecast</span>
        <span className="vitd-subtitle">Based on UV, sun angle &amp; your skin type</span>
      </div>

      {/* Fitzpatrick skin type picker */}
      <div className="vitd-picker-row">
        <span className="vitd-picker-label">Skin type:</span>
        <div className="vitd-swatches" role="radiogroup" aria-label="Fitzpatrick skin type">
          {SKIN_TYPES.map(({ type, label, swatch, text, desc }) => (
            <button
              key={type}
              role="radio"
              aria-checked={skinType === type}
              className={`vitd-swatch${skinType === type ? " vitd-swatch--active" : ""}`}
              style={{ background: swatch, color: text }}
              onClick={() => setSkinType(type)}
              title={`Type ${label} – ${desc}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="vitd-skin-name">{selected.desc}</span>
      </div>

      <button
        className="vitd-btn"
        onClick={handleFetch}
        disabled={loading || !location}
      >
        {loading ? "⏳ Calculating…" : "Get Vitamin D Forecast"}
      </button>

      {!location && !error && (
        <p className="vitd-notice">📍 Enable location to use this feature.</p>
      )}
      {error && <p className="vitd-error">⚠️ {error}</p>}

      {result && (
        <div className="vitd-result">
          {/* Index badge */}
          <div className="vitd-index-row">
            <span
              className="vitd-index-value"
              style={{ color: indexColor(result.vitamin_d_index) }}
            >
              {result.vitamin_d_index}
              <span className="vitd-index-denom">/10</span>
            </span>
            <span className="vitd-index-label">Synthesis Index</span>
          </div>

          <p className="vitd-recommendation">{result.recommendation}</p>
          <div className="vitd-context-row">
            <span>Current conditions</span>
            {result.day_phase && <span>Phase: {result.day_phase}</span>}
            {result.protection_after_minutes !== undefined && result.protection_after_minutes !== null && (
              <span>Protect after: {result.protection_after_minutes} min</span>
            )}
          </div>

          {/* Stats grid */}
          <div className="vitd-stats">
            <div className="vitd-stat">
              <span className="vitd-stat-icon">⏱️</span>
              <span className="vitd-stat-value">
                {result.synthesis_minutes !== null ? `${result.synthesis_minutes} min` : "N/A"}
              </span>
              <span className="vitd-stat-label">{result.exposure_window_label || "Useful window"}</span>
            </div>
            <div className="vitd-stat">
              <span className="vitd-stat-icon">🔆</span>
              <span className="vitd-stat-value">UV {result.uv_index}</span>
              <span className="vitd-stat-label">UV Index</span>
            </div>
            <div className="vitd-stat">
              <span className="vitd-stat-icon">📐</span>
              <span className="vitd-stat-value">{result.sun_elevation}°</span>
              <span className="vitd-stat-label">Sun angle</span>
            </div>
            <div className="vitd-stat">
              <span className="vitd-stat-icon">☁️</span>
              <span className="vitd-stat-value">{result.cloud_cover_pct}%</span>
              <span className="vitd-stat-label">Cloud cover</span>
            </div>
          </div>

          <p className="vitd-skin-used">{result.skin_type_label}</p>
          <p className="vitd-safety-note">
            {result.sun_safety_note ||
              "Vitamin D estimates are approximate. Avoid burning. Sunscreen after the useful exposure window is not defeat; it is not being a crispy idiot."}
          </p>
        </div>
      )}
    </div>
  );
}
