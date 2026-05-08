import React from 'react';

export default function SupportCard({
  variant = "coffee",
  image,
  href = "https://ko-fi.com/doppleredward",
  title = "Buy Donkey a Coffee",
  subtitle = "Keep the forecasts flowing.",
  ariaLabel = "Support Mister Donkey on Ko-Fi",
}) {
  return (
    <a
      className={`support-card support-card--thumbnail support-card--${variant}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      {image && <img src={image} alt="" className="support-card-img" aria-hidden="true" />}
      <span className="support-card-title">{title}</span>
      <span className="support-card-subtitle">{subtitle}</span>
    </a>
  );
}
