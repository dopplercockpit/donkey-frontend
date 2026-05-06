import React from "react";
import "./HourlyForecast.css";

export interface HourlyPoint {
  time: string;
  hour_label: string;
  temp_c: number | null;
  temp_f: number | null;
  conditions: string;
  condition_code: number | null;
  precip_chance: number;
  is_current: boolean;
}

interface HourlyForecastProps {
  hourly: HourlyPoint[];
  tempUnit?: "C" | "F";
}

function conditionEmoji(code: number | null): string {
  if (code === null) return "🌡️";
  if (code === 1000) return "☀️";
  if (code <= 1009) return "⛅";
  if (code <= 1147) return "🌫️";
  if (code <= 1201) return "🌧️";
  if (code <= 1264) return "❄️";
  return "⛈️"; // 1273+ thunderstorm
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  tempUnit = "C",
}) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="hourly-wrap" aria-label="Hourly forecast">
      <div className="hourly-scroll">
        {hourly.map((h, i) => {
          const temp = tempUnit === "F" ? h.temp_f : h.temp_c;
          const tempStr = temp != null ? `${Math.round(temp)}°${tempUnit}` : "—";

          return (
            <div
              key={h.time ?? i}
              className={`hourly-card${h.is_current ? " hourly-card--current" : ""}`}
              aria-current={h.is_current ? "true" : undefined}
            >
              <span className="hourly-label">{h.hour_label}</span>
              <span className="hourly-emoji" title={h.conditions}>
                {conditionEmoji(h.condition_code)}
              </span>
              <span className="hourly-temp">{tempStr}</span>
              {h.precip_chance > 20 && (
                <span className="hourly-precip">💧{h.precip_chance}%</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="hourly-fade" aria-hidden="true" />
    </div>
  );
};

export default HourlyForecast;
