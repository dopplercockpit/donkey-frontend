import React from 'react';
import './UnitToggle.css';

export default function UnitToggle({ tempUnit = 'C', onChange }) {
  return (
    <div className="unit-toggle" role="group" aria-label="Temperature unit">
      {['C', 'F'].map((unit) => (
        <button
          key={unit}
          type="button"
          className={tempUnit === unit ? 'active' : ''}
          aria-pressed={tempUnit === unit}
          onClick={() => onChange?.(unit)}
        >
          &deg;{unit}
        </button>
      ))}
    </div>
  );
}
