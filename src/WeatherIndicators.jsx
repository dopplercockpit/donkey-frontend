import React from 'react';
import './WeatherIndicators.css';

function Indicator({ label, value, icon }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="indicator-tile" role="listitem">
      {icon && <span className="indicator-icon">{icon}</span>}
      <span className="indicator-value">{value}</span>
      <span className="indicator-label">{label}</span>
    </div>
  );
}

export default function WeatherIndicators({ weather, tempUnit = "C" }) {
  if (!weather?.current) return null;
  const c = weather.current;
  const conditions = c.conditions || c.condition || c.condition_main || c.conditions_code || null;
  const windKph = c.wind_kph ?? c.wind_speed_kmh;
  const windMph = c.wind_mph ?? c.wind_speed_mph;
  const precipProbability = c.precip_probability ?? c.precip_chance;

  const tempDisplay = tempUnit === "F"
    ? c.temp_f != null ? `${Math.round(c.temp_f)}\u00b0F` : null
    : c.temp_c != null ? `${Math.round(c.temp_c)}\u00b0C` : null;

  const feelsLike = tempUnit === "F"
    ? c.feels_like_f != null ? `${Math.round(c.feels_like_f)}\u00b0F` : null
    : c.feels_like_c != null ? `${Math.round(c.feels_like_c)}\u00b0C` : null;

  const wind = tempUnit === "F" && windMph != null
    ? `${Math.round(windMph)} mph`
    : windKph != null
      ? `${Math.round(windKph)} km/h`
      : null;

  const humidity = c.humidity != null
    ? `${c.humidity}%`
    : null;

  const precip = precipProbability != null
    ? `${precipProbability}%`
    : null;

  const airQuality = weather.air_quality || null;

  return (
    <div className="weather-indicators" role="list">
      <Indicator icon={c.icon || "\uD83C\uDF21\uFE0F"} label="Conditions" value={conditions} />
      <Indicator icon="\uD83C\uDF21\uFE0F" label="Temperature" value={tempDisplay} />
      {feelsLike && <Indicator icon="\uD83E\uDD14" label="Feels like" value={feelsLike} />}
      {humidity && <Indicator icon="\uD83D\uDCA7" label="Humidity" value={humidity} />}
      {wind && <Indicator icon="\uD83D\uDCA8" label="Wind" value={wind} />}
      {precip && <Indicator icon="\u2614" label="Precip chance" value={precip} />}
      {airQuality && <Indicator icon="\uD83C\uDF3F" label="Air quality" value={airQuality} />}
    </div>
  );
}
