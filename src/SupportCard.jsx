import React from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SupportCard({
  variant = "coffee",
  image,
  href = "https://ko-fi.com/weatherjackass",
  title = "Buy Donkey a Coffee",
  subtitle = "Keep the forecasts flowing.",
  ariaLabel = "Support Mister Donkey on Ko-Fi",
  prominent = false,
  analyticsContext = null,
}) {
  const handleClick = () => {
    try {
      fetch(`${BASE_URL}/metrics/kofi-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyticsContext || {}),
        keepalive: true,
      });
    } catch {
      // Ko-Fi navigation must not depend on analytics.
    }
  };

  return (
    <a
      className={`support-card support-card--thumbnail support-card--${variant}${prominent ? " support-card--prominent" : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {image && <img src={image} alt="" className="support-card-img" aria-hidden="true" />}
      <span className="support-card-title">{title}</span>
      <span className="support-card-subtitle">{subtitle}</span>
    </a>
  );
}
