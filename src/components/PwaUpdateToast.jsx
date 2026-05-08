import React, { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import "./PwaUpdateToast.css";

export default function PwaUpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState(null);

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisteredSW(_swUrl, registration) {
        registration?.update();
      },
    });

    setUpdateServiceWorker(() => updateSW);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="pwa-update-toast" role="status" aria-live="polite">
      <span>🐴 New donkey deployed. Refresh to stop using yesterday&apos;s weather bullshit.</span>
      <button type="button" onClick={() => updateServiceWorker?.(true)}>
        Refresh
      </button>
    </div>
  );
}
