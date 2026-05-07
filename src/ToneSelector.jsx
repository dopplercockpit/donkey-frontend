import React, { useState, useEffect } from 'react';
import './ToneSelector.css';
import { DONKEY_GUIDES } from './data/donkeyGuides';

// Map backend tone IDs to guide images
const PERSONA_IMAGES = Object.fromEntries(DONKEY_GUIDES.map(g => [g.toneId, g.image]));

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ToneSelector = ({ selectedTone, onToneChange }) => {
  const [tones, setTones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTones = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tones`);
        const data = await response.json();
        setTones(data.tones || []);
      } catch (error) {
        console.error("Failed to fetch tones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTones();
  }, []);

  if (loading) {
    return <div className="character-selector-loading">Loading characters...</div>;
  }

  return (
    <div className="character-selector">
      <label className="selector-label">Choose your guide:</label>
      <div className="character-cards">
        {tones.map(tone => {
          const personaImg = PERSONA_IMAGES[tone.id];
          return (
            <button
              key={tone.id}
              type="button"
              className={`character-card ${personaImg ? 'character-card--persona' : ''} ${tone.id === selectedTone ? 'selected' : ''}`}
              onClick={() => onToneChange(tone.id)}
              title={tone.description}
            >
              {personaImg ? (
                <img
                  src={personaImg}
                  alt={tone.name}
                  className="character-persona-img"
                />
              ) : (
                <>
                  <div className="character-avatar-wrap">
                    <img
                      src={tone.image || `/characters/${tone.character_slug}.png`}
                      alt={tone.name}
                      className="character-avatar"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="character-emoji-fallback">{tone.emoji}</span>
                  </div>
                  <span className="character-name">{tone.name}</span>
                  <span className="character-desc">{tone.description}</span>
                </>
              )}
              {tone.is_default && <span className="character-badge">default</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToneSelector;
