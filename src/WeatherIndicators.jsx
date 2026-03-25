import React from 'react';
import './WeatherIndicators.css';

function Indicator({ label, value, icon }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="indicator-tile">
      {icon && <span className="indicator-icon">{icon}</span>}
      <span className="indicator-value">{value}</span>
      <span className="indicator-label">{label}</span>
    </div>
  );
}

export default function WeatherIndicators({ weather }) {
  if (!weather?.current) return null;
  const c = weather.current;

  const tempDisplay = [
    c.temp_c !== undefined && c.temp_c !== null ? `${c.temp_c}°C` : null,
    c.temp_f !== undefined && c.temp_f !== null ? `${c.temp_f}°F` : null,
  ].filter(Boolean).join(' / ') || null;

  const feelsLike = c.feels_like_c !== undefined && c.feels_like_c !== null
    ? `${c.feels_like_c}°C`
    : null;

  const wind = c.wind_kph !== undefined && c.wind_kph !== null
    ? `${c.wind_kph} km/h`
    : null;

  const humidity = c.humidity !== undefined && c.humidity !== null
    ? `${c.humidity}%`
    : null;

  const precip = c.precip_probability !== undefined && c.precip_probability !== null
    ? `${c.precip_probability}%`
    : null;

  const airQuality = weather.air_quality || null;

  return (
    <div className="weather-indicators">
      <Indicator icon={c.icon || "🌡️"} label="Conditions" value={c.conditions} />
      <Indicator icon="🌡️" label="Temperature" value={tempDisplay} />
      {feelsLike && <Indicator icon="🤔" label="Feels like" value={feelsLike} />}
      {humidity && <Indicator icon="💧" label="Humidity" value={humidity} />}
      {wind && <Indicator icon="💨" label="Wind" value={wind} />}
      {precip && <Indicator icon="☔" label="Precip chance" value={precip} />}
      {airQuality && <Indicator icon="🌿" label="Air quality" value={airQuality} />}
    </div>
  );
}
