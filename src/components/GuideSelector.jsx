import React from "react";
import { DONKEY_GUIDES } from "../data/donkeyGuides";

export default function GuideSelector({ selectedGuideId, onSelectGuide }) {
  return (
    <section className="guide-selector-section" aria-label="Choose your forecast guide">
      <p className="guide-selector-title">Choose your guide</p>
      <div className="guide-grid">
        {DONKEY_GUIDES.map((guide) => (
          <button
            key={guide.id}
            type="button"
            className={`guide-card${selectedGuideId === guide.id ? " selected" : ""}`}
            onClick={() => onSelectGuide(guide.id)}
            aria-pressed={selectedGuideId === guide.id}
          >
            {guide.id === "default" && <span className="guide-badge">DEFAULT</span>}
            <img src={guide.image} alt={guide.title} className="guide-image" />
            <span className="guide-title">{guide.title}</span>
            <span className="guide-description">{guide.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
