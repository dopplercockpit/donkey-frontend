import React, { useState, useEffect, useRef } from 'react';
import './ToneSelector.css';
import { DONKEY_GUIDES } from './data/donkeyGuides';

// Map backend tone IDs to guide images
const PERSONA_IMAGES = Object.fromEntries(DONKEY_GUIDES.map(g => [g.toneId, g.image]));

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ToneSelector = ({ selectedTone, onToneChange }) => {
  const [tones, setTones] = useState([]);
  const [loading, setLoading] = useState(true);
  const buttonRefs = useRef([]);

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

  const focusToneAt = (index) => {
    const tone = tones[index];
    if (!tone) return;
    onToneChange(tone.id);
    requestAnimationFrame(() => buttonRefs.current[index]?.focus());
  };

  const handleToneKeyDown = (event, index) => {
    if (!tones.length) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusToneAt((index + 1) % tones.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusToneAt((index - 1 + tones.length) % tones.length);
        break;
      case "Home":
        event.preventDefault();
        focusToneAt(0);
        break;
      case "End":
        event.preventDefault();
        focusToneAt(tones.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onToneChange(tones[index].id);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <div className="character-selector-loading">Loading characters...</div>;
  }

  return (
    <div className="character-selector">
      <div className="selector-label" id="tone-selector-label">Choose your guide:</div>
      <div className="character-cards" role="radiogroup" aria-labelledby="tone-selector-label">
        {tones.map((tone, index) => {
          const personaImg = PERSONA_IMAGES[tone.id];
          return (
            <button
              key={tone.id}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              className={`character-card ${personaImg ? 'character-card--persona' : ''} ${tone.id === selectedTone ? 'selected' : ''}`}
              onClick={() => onToneChange(tone.id)}
              onKeyDown={(event) => handleToneKeyDown(event, index)}
              role="radio"
              aria-checked={tone.id === selectedTone}
              tabIndex={tone.id === selectedTone ? 0 : -1}
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
