import React, { useState, useRef, useCallback, useEffect } from "react";
import "./OnboardingModal.css";
import { DONKEY_GUIDES } from "../data/donkeyGuides";
import donkeyLogo from "../assets/mister_donkey_logo.webp";

const STORAGE_KEY = "md_onboarded";

interface Props {
  selectedGuideId: string;
  onSelectGuide: (id: string) => void;
  onComplete: () => void;
}

const PANEL_COUNT = 3;

export default function OnboardingModal({ selectedGuideId, onSelectGuide, onComplete }: Props) {
  const [panel, setPanel] = useState(0);

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const advance = useCallback(() => {
    if (panel < PANEL_COUNT - 1) {
      setPanel(p => p + 1);
    } else {
      finish();
    }
  }, [panel]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  }, [onComplete]);

  // Swipe handling
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only treat as horizontal swipe if dx dominates
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && panel < PANEL_COUNT - 1) setPanel(p => p + 1); // swipe left → next
    if (dx > 0 && panel > 0) setPanel(p => p - 1);               // swipe right → back
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" && panel < PANEL_COUNT - 1) setPanel(p => p + 1);
      if (e.key === "ArrowLeft"  && panel > 0)               setPanel(p => p - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panel, finish]);

  const isLast = panel === PANEL_COUNT - 1;

  return (
    <div
      className="ob-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Mister Donkey"
    >
      <div
        className="ob-modal"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Dot indicators */}
        <div className="ob-dots" aria-hidden="true">
          {Array.from({ length: PANEL_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ob-dot${panel === i ? " ob-dot--active" : ""}`}
              onClick={() => setPanel(i)}
              aria-label={`Go to panel ${i + 1}`}
            />
          ))}
        </div>

        {/* Skip always available */}
        <button type="button" className="ob-skip" onClick={finish} aria-label="Skip onboarding">
          Skip
        </button>

        {/* Panels */}
        <div className="ob-panels" style={{ transform: `translateX(-${panel * 100}%)` }}>

          {/* ── Panel 0: Welcome ── */}
          <div className="ob-panel" aria-hidden={panel !== 0}>
            <img src={donkeyLogo} alt="Mister Donkey" className="ob-logo" />
            <h2 className="ob-heading">Meet Mister Donkey</h2>
            <p className="ob-body">
              Your sarcastic, brutally accurate weather guide.
              Less fluff. More forecast. Zero meteorological foreplay.
            </p>
            <p className="ob-body ob-body--muted">
              Pick a personality, share your location, and we'll tell you
              exactly what the sky is doing — and why it's your problem.
            </p>
          </div>

          {/* ── Panel 1: Pick your personality ── */}
          <div className="ob-panel ob-panel--guides" aria-hidden={panel !== 1}>
            <h2 className="ob-heading">Pick your guide</h2>
            <p className="ob-body ob-body--muted">Who's delivering your forecast today?</p>
            <div className="ob-guide-grid">
              {DONKEY_GUIDES.map(guide => (
                <button
                  key={guide.id}
                  type="button"
                  className={`ob-guide-card${selectedGuideId === guide.id ? " ob-guide-card--selected" : ""}`}
                  onClick={() => onSelectGuide(guide.id)}
                  aria-pressed={selectedGuideId === guide.id}
                >
                  <img src={guide.image} alt={guide.title} className="ob-guide-img" />
                  <span className="ob-guide-name">{guide.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Panel 2: Location ── */}
          <div className="ob-panel" aria-hidden={panel !== 2}>
            <div className="ob-location-icon" aria-hidden="true">📍</div>
            <h2 className="ob-heading">Your location helps</h2>
            <p className="ob-body">
              Mister Donkey uses your location to pull the actual weather
              for wherever you are — not some city three states away.
            </p>
            <p className="ob-body ob-body--muted">
              We don't store it. We just use it to stop guessing.
              You can disable location any time from the controls below the forecast.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="ob-nav">
          {panel > 0 && (
            <button type="button" className="ob-btn ob-btn--ghost" onClick={() => setPanel(p => p - 1)}>
              Back
            </button>
          )}
          <button type="button" className="ob-btn ob-btn--primary" onClick={advance}>
            {isLast ? "Let's go 🐴" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Static helper — no React needed
export function shouldShowOnboarding(): boolean {
  return !localStorage.getItem(STORAGE_KEY);
}
