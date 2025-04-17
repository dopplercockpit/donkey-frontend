import React, { useState } from 'react';
import './PromptForm.css';


const PromptForm = ({ location }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState({ summary: '', alerts_summary: '', severe_alerts: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      prompt,
      location: location || null  // include location if available
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('🟢 Backend response:', data);

      if (data && (data.summary || data.alerts_summary || data.severe_alerts)) {
        setResult(data);
      } else {
        setResult({ summary: "🤖 Sorry, I couldn’t generate a forecast right now. Try again later!", alerts_summary: '', severe_alerts: [] });
      }

    } catch (error) {
      console.error('🔥 Error hitting backend:', error);
      setResult({ summary: '💥 Could not fetch response from donkey backend.', alerts_summary: '', severe_alerts: [] });
    }
  };

  return (
    <div className="prompt-wrapper">
      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          className="prompt-input"
          type="text"
          placeholder="Ask me the weather..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="prompt-button" type="submit">Go</button>
      </form>

      <div className="result-card">
        {result.summary || "...And I'll tell you what I know!"}
      </div>

      {/* Clean and deduplicate alerts */}
    {result.severe_alerts && result.severe_alerts.length > 0 && (
      <div style={{
        marginTop: '1rem',
        background: '#fff8e1',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ffcc00',
        boxShadow: '0 2px 6px rgba(255, 204, 0, 0.4)',
        color: '#6a4f00',
        fontWeight: '600',
        animation: 'fadeIn 0.5s ease-in-out',
      }}>
        {/* Summary at the top */}
        {result.alerts_summary && (
          <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            🌦️ <strong>{result.alerts_summary}</strong>
          </div>
        )}

        {/* Deduped full alert messages */}
        {[...new Set(
          result.severe_alerts.map(alert =>
            alert.replace(/\s+/g, ' ').trim()  // normalize whitespace
          )
        )].map((alert, index) => (
          <div key={index} style={{ marginBottom: '0.75rem' }}>
            ⚠️ 🚨 {alert}
          </div>
        ))}
      </div>
    )}



{result.alerts_summary && (
  <div style={{ 
    marginTop: '1rem', 
    background: '#fff8e1', 
    padding: '1rem', 
    borderRadius: '8px', 
    border: '1px solid #ffcc00', 
    boxShadow: '0 2px 6px rgba(255, 204, 0, 0.4)', 
    color: '#6a4f00',
    fontWeight: '600',
    animation: 'fadeIn 0.5s ease-in-out',
    whiteSpace: 'pre-wrap'
  }}>
    {result.alerts_summary
      .split("....") // Change this if your alert delimiter is different
      .filter(alert => alert.trim().length > 0)
      .map((alert, index) => {
        const trimmed = alert.trim();
        const emoji =
          trimmed.includes('Avalanche') ? '🏔️' :
          trimmed.includes('Frost') ? '🥶' :
          trimmed.includes('Storm') ? '⛈️' :
          trimmed.includes('Flood') ? '🌊' :
          trimmed.includes('Rain') ? '🌧️' :
          trimmed.includes('Heat') ? '🔥' :
          trimmed.includes('Wind') ? '💨' :
          '⚠️';

        return (
          <p key={index} style={{ marginBottom: '1rem' }}>
            {emoji} {trimmed}
          </p>
        );
      })}
  </div>
)}


      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default PromptForm;
// This component handles the user input for weather prompts and displays the results.