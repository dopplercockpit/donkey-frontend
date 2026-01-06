import React, { useState, useEffect } from 'react';
import './ToneSelector.css';

const ToneSelector = ({ selectedTone, onToneChange }) => {
  const [tones, setTones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTones = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${baseURL}/tones`);
        const data = await response.json();
        setTones(data.tones || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tones:", error);
        setLoading(false);
      }
    };

    fetchTones();
  }, []);

  if (loading) {
    return <div className="tone-selector-loading">Loading donkeys...</div>;
  }

  const currentTone = tones.find(t => t.id === selectedTone) || tones[0];

  return (
    <div className="tone-selector">
      <label className="tone-label">Choose your donkey:</label>
      <div className="tone-dropdown-wrapper">
        <button
          type="button"
          className="tone-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="tone-emoji">{currentTone?.emoji}</span>
          <span className="tone-name">{currentTone?.name}</span>
          <span className="tone-arrow">{showDropdown ? '▲' : '▼'}</span>
        </button>

        {showDropdown && (
          <div className="tone-dropdown">
            {tones.map(tone => (
              <button
                key={tone.id}
                type="button"
                className={`tone-option ${tone.id === selectedTone ? 'selected' : ''}`}
                onClick={() => {
                  onToneChange(tone.id);
                  setShowDropdown(false);
                }}
              >
                <span className="tone-emoji">{tone.emoji}</span>
                <span className="tone-name">{tone.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToneSelector;
