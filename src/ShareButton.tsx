import React, { useState, useCallback } from 'react';
import './ShareButton.css';

interface ShareButtonProps {
  textSummary?: string | null;
  locationLabel?: string | null;
  tone?: string | null;
  sessionId?: string | null;
}

const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://weatherjackass.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FALLBACK_SHARE_TEXT =
  'Mister Donkey just insulted my weather. Get yours: https://weatherjackass.com';

function firstUsefulLine(text?: string | null): string {
  return (text || '')
    .split(/\n\n+|\n/)
    .map((line) => line.trim())
    .find(Boolean) || '';
}

function buildShareText(textSummary?: string | null, locationLabel?: string | null): string {
  const line = firstUsefulLine(textSummary);
  if (!line) return FALLBACK_SHARE_TEXT;

  const location = (locationLabel || '').trim();
  const weatherLine = location && !line.toLowerCase().includes(location.toLowerCase())
    ? `${location}: ${line}`
    : line;

  return `Mister Donkey says ${weatherLine}. Get insulted by your forecast: ${SITE_URL}`;
}

async function postShareMetric(payload: {
  action: 'clicked' | 'shared' | 'copied' | 'manual_copy';
  locationLabel?: string | null;
  tone?: string | null;
  sessionId?: string | null;
}) {
  try {
    await fetch(`${API_BASE_URL}/metrics/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: payload.action,
        session_id: payload.sessionId || undefined,
        tone: payload.tone || undefined,
        location: payload.locationLabel ? { name: payload.locationLabel } : undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block sharing.
  }
}

export default function ShareButton({
  textSummary,
  locationLabel,
  tone,
  sessionId,
}: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'manual'>('idle');
  const [manualText, setManualText] = useState('');

  const showStatus = useCallback((nextStatus: typeof status) => {
    setStatus(nextStatus);
    if (nextStatus === 'success' || nextStatus === 'error') {
      window.setTimeout(() => setStatus('idle'), 2400);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const shareText = buildShareText(textSummary, locationLabel);
    const payload = {
      title: 'Mister Donkey Weather',
      text: shareText,
      url: SITE_URL,
    };

    setStatus('idle');
    setManualText('');
    postShareMetric({ action: 'clicked', locationLabel, tone, sessionId });

    if (navigator.share) {
      try {
        await navigator.share(payload);
        showStatus('success');
        postShareMetric({ action: 'shared', locationLabel, tone, sessionId });
      } catch (err: any) {
        // User cancelled share; keep the UI neutral because nothing failed.
        if (err?.name !== 'AbortError') {
          console.warn('Share failed:', err);
          showStatus('error');
        }
      }
      return;
    }

    // Previous clipboard-only implementation replaced to support native share + manual fallback.
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(payload.text);
      showStatus('success');
      postShareMetric({ action: 'copied', locationLabel, tone, sessionId });
    } catch {
      console.warn('Clipboard copy failed');
      setManualText(payload.text);
      setStatus('manual');
      postShareMetric({ action: 'manual_copy', locationLabel, tone, sessionId });
    }
  }, [locationLabel, sessionId, showStatus, textSummary, tone]);

  return (
    <span className="share-wrap">
      <button
        type="button"
        className={`share-btn share-btn--${status}`}
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
          <path d="M10 12V3M10 3L7 6M10 3l3 3" />
          <path d="M4 11v5a1 1 0 001 1h10a1 1 0 001-1v-5" />
        </svg>
      </button>
      {status === 'success' && (
        <span className="share-toast" role="status">Shared!</span>
      )}
      {status === 'error' && (
        <span className="share-toast share-toast--error" role="status">Share failed</span>
      )}
      {status === 'manual' && (
        <span className="share-manual" role="status">
          <span>Copy this:</span>
          <textarea
            value={manualText}
            readOnly
            rows={3}
            onFocus={(event) => event.currentTarget.select()}
            aria-label="Manual share text"
          />
        </span>
      )}
    </span>
  );
}
