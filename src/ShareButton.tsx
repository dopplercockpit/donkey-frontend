import React, { useState, useCallback } from 'react';
import './ShareButton.css';

interface ShareButtonProps {
  textSummary: string;
}

export default function ShareButton({ textSummary }: ShareButtonProps) {
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = useCallback(async () => {
    const firstPara = textSummary.split(/\n\n+/)[0]?.trim() ?? textSummary;
    const payload = {
      title: 'Mister Donkey says:',
      text: firstPara,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch (err: any) {
        // User cancelled share — not an error worth surfacing
        if (err?.name !== 'AbortError') console.warn('Share failed:', err);
      }
      return;
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${payload.title}\n\n${payload.text}\n\n${payload.url}`);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2200);
    } catch {
      console.warn('Clipboard copy failed');
    }
  }, [textSummary]);

  return (
    <span className="share-wrap">
      <button
        type="button"
        className="share-btn"
        onClick={handleShare}
        aria-label="Share this forecast"
        title="Share"
      >
        <svg
          className="share-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Arrow up from box */}
          <path d="M10 12V3M10 3L7 6M10 3l3 3" />
          <path d="M4 11v5a1 1 0 001 1h10a1 1 0 001-1v-5" />
        </svg>
      </button>
      {toastVisible && (
        <span className="share-toast" role="status">Copied!</span>
      )}
    </span>
  );
}
