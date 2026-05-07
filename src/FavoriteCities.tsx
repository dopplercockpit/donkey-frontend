import React, { useState, useEffect, useCallback } from 'react';
import './FavoriteCities.css';

const STORAGE_KEY = 'mister_donkey_favorites';
const MAX_FAVORITES = 5;

export interface FavoriteCity {
  name: string;
  lat: number;
  lon: number;
}

interface FavoriteCitiesProps {
  cityName: string | null;
  location: { lat: number; lon: number } | null;
  onSelectCity: (city: FavoriteCity) => void;
}

function loadFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteCity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export default function FavoriteCities({ cityName, location, onSelectCity }: FavoriteCitiesProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(loadFavorites);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(loadFavorites().map(f => f.name))
  );

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const canAdd =
    !!cityName &&
    !!location &&
    favorites.length < MAX_FAVORITES &&
    !favorites.some(f => f.name === cityName);

  const addCurrent = useCallback(() => {
    if (!canAdd || !cityName || !location) return;
    const next = [...favorites, { name: cityName, lat: location.lat, lon: location.lon }];
    setFavorites(next);
    setVisibleKeys(prev => new Set([...prev, cityName]));
  }, [canAdd, cityName, location, favorites]);

  const remove = useCallback((name: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    // Wait for fade-out before removing from state
    setTimeout(() => {
      setFavorites(prev => prev.filter(f => f.name !== name));
    }, 220);
  }, []);

  if (favorites.length === 0 && !canAdd) return null;

  return (
    <div className="fav-row" aria-label="Favorite cities">
      {favorites.map(fav => (
        <span
          key={fav.name}
          className={`fav-pill${visibleKeys.has(fav.name) ? ' fav-pill--visible' : ''}`}
        >
          <button
            type="button"
            className="fav-pill-name"
            onClick={() => onSelectCity(fav)}
            title={`Load weather for ${fav.name}`}
          >
            📍 {fav.name}
          </button>
          <button
            type="button"
            className="fav-pill-remove"
            onClick={() => remove(fav.name)}
            aria-label={`Remove ${fav.name}`}
          >
            ✕
          </button>
        </span>
      ))}

      {canAdd && (
        <button type="button" className="fav-add-btn" onClick={addCurrent}>
          + Save city
        </button>
      )}
    </div>
  );
}
