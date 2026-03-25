import React from 'react';

export default function SupportCard() {
  return (
    <div className="support-card">
      <p className="support-card-heading">☕ Like the Donkey?</p>
      <p className="support-card-body">Keep the forecasts flowing.</p>
      <a
        href="https://ko-fi.com/doppleredward"
        target="_blank"
        rel="noopener noreferrer"
        className="kofi-btn"
      >
        Buy us a coffee
      </a>
    </div>
  );
}
