import React, { useState, useEffect, useCallback, useRef } from 'react';
import PromptForm from './PromptForm';
import GeoControls from './GeoControls';
import SupportCard from './SupportCard';
import ConversationHistory from './ConversationHistory';
import HourlyForecast from './HourlyForecast';
import FavoriteCities from './FavoriteCities';
import WeatherIndicators from './WeatherIndicators';
import GuideSelector from './components/GuideSelector';
import OnboardingModal, { shouldShowOnboarding } from './components/OnboardingModal';
import PwaUpdateToast from './components/PwaUpdateToast';
import SkeletonWeatherCard from './components/SkeletonWeatherCard';
import { getDonkeyGuideById } from './data/donkeyGuides';
import { getDonkeyMoodDebug } from './utils/weatherMood';
import './App.css';
import donkeyLogo from './assets/mister_donkey_logo.png';
import kofiCoffeeDonkey from './assets/kofi_coffee_donkey.png';
import kofiBeerDonkey from './assets/kofi_beer_donkey.png';
import donkeySunny from './assets/moods/donkey_sunny.png';
import donkeyRainy from './assets/moods/donkey_rainy.png';
import donkeySnowy from './assets/moods/donkey_snowy.png';
import donkeyWindy from './assets/moods/donkey_windy.png';
import donkeyFoggy from './assets/moods/donkey_foggy.png';
import donkeyHot from './assets/moods/donkey_hot.png';
import donkeyThunder from './assets/moods/donkey_thunder.png';
import donkeyAfterStorm from './assets/moods/donkey_after_storm.png';
import donkeyDefaultMood from './assets/moods/donkey_default.png';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const KOFI_COFFEE_URL =
  import.meta.env.VITE_KOFI_COFFEE_URL || "https://ko-fi.com/doppleredward";
const KOFI_BEER_URL =
  import.meta.env.VITE_KOFI_BEER_URL || "https://ko-fi.com/doppleredward";

// WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
const WEATHER_THEMES = {
  // Clear / sunny
  1000: { '--accent-primary': '#e8870a', '--bg-secondary': '#2a2518' },
  // Partly cloudy
  1003: { '--accent-primary': '#c8903a', '--bg-secondary': '#252b33' },
  // Cloudy / overcast
  1006: { '--accent-primary': '#7a8a9a', '--bg-secondary': '#252b33' },
  1009: { '--accent-primary': '#7a8a9a', '--bg-secondary': '#252b33' },
  // Mist / fog
  1030: { '--accent-primary': '#8a9aaa', '--bg-secondary': '#252b33' },
  1135: { '--accent-primary': '#8a9aaa', '--bg-secondary': '#252b33' },
  1147: { '--accent-primary': '#8a9aaa', '--bg-secondary': '#252b33' },
  // Rain (drizzle, light, moderate, heavy)
  1063: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1072: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1150: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1153: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1168: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1171: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1180: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1183: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1186: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1189: { '--accent-primary': '#5a7a8a', '--bg-secondary': '#1e2830' },
  1192: { '--accent-primary': '#4a6a7a', '--bg-secondary': '#1a2428' },
  1195: { '--accent-primary': '#4a6a7a', '--bg-secondary': '#1a2428' },
  1198: { '--accent-primary': '#4a6a7a', '--bg-secondary': '#1a2428' },
  1201: { '--accent-primary': '#4a6a7a', '--bg-secondary': '#1a2428' },
  // Snow
  1066: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1069: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1114: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1117: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1204: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1207: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1210: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1213: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1216: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1219: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1222: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1225: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1237: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1249: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1252: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1255: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1258: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1261: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  1264: { '--accent-primary': '#4a9eda', '--bg-secondary': '#1e2838' },
  // Thunderstorm
  1087: { '--accent-primary': '#4a4a7a', '--bg-secondary': '#18181e' },
  1273: { '--accent-primary': '#4a4a7a', '--bg-secondary': '#18181e' },
  1276: { '--accent-primary': '#4a4a7a', '--bg-secondary': '#18181e' },
  1279: { '--accent-primary': '#4a4a7a', '--bg-secondary': '#18181e' },
  1282: { '--accent-primary': '#4a4a7a', '--bg-secondary': '#18181e' },
};

const DEFAULT_THEME = {
  '--accent-primary': '#e8834a',
  '--bg-secondary': '#252b33',
};

const HEAT_THEME = {
  '--accent-primary': '#d44a1a',
  '--bg-secondary': '#2a1a14',
};

function getThemeFromConditionText(current) {
  const conditionText = [
    current?.condition_main,
    current?.conditions_code,
    current?.conditions,
    current?.condition,
  ].filter(Boolean).join(' ').toLowerCase();

  if (/thunder|lightning|storm/.test(conditionText)) return WEATHER_THEMES[1087];
  if (/snow|sleet|ice|freez|frost/.test(conditionText)) return WEATHER_THEMES[1066];
  if (/fog|mist|haze|smoke/.test(conditionText)) return WEATHER_THEMES[1030];
  if (/rain|drizzle|shower|precip/.test(conditionText)) return WEATHER_THEMES[1063];
  if (/clear|sunny/.test(conditionText)) return WEATHER_THEMES[1000];
  if (/cloud|overcast/.test(conditionText)) return WEATHER_THEMES[1006];
  if (/heat|hot|heatwave/.test(conditionText)) return HEAT_THEME;
  return null;
}

function applyWeatherTheme(data) {
  const root = document.documentElement;
  const current = data?.weather?.current;
  const conditionCode = current?.condition_code ?? current?.conditions_code;
  const conditionTheme = WEATHER_THEMES[conditionCode] ?? getThemeFromConditionText(current);
  const theme =
    current?.temp_c > 35
      ? HEAT_THEME
      : conditionTheme ?? DEFAULT_THEME;

  Object.entries(theme).forEach(([prop, val]) => root.style.setProperty(prop, val));
}

const DONKEY_MOOD_IMAGES = {
  sunny:       donkeySunny,
  rainy:       donkeyRainy,
  snowy:       donkeySnowy,
  windy:       donkeyWindy,
  foggy:       donkeyFoggy,
  hot:         donkeyHot,
  thunder:     donkeyThunder,
  after_storm: donkeyAfterStorm,
  // TODO: replace fallbacks when donkey_chilly.png and donkey_pleasant_night.png are added.
  chilly:      donkeyDefaultMood,
  pleasant_night: donkeyDefaultMood,
  default:     donkeyDefaultMood,
};

const donkeyTaglines = [
  "I check the sky so you don't have to read numbers.",
  "Helping you avoid soggy socks and nasty little sunburns.",
  "Forecasts so accurate, you'll think I'm dating Mother Nature.",
  "Sun? Snow? Sleet? The Sky? I'll tell you what's falling, and when to run.",
  "If you walk outside dressed wrong, it's no longer your fault.",
  "For people who hate guessing the weather... and wearing pants.",
  "Science, clouds, data, a jackass, and a whole lotta love.",
  "I'm the reason you won't need to look out the window.",
  "Weather so clear, you can stop watching the news.",
  "I'm like a cursed meteorological horcrux, but in the best possible way 🌦️💀",
  "Give 'em the storm before they ask for it.",
  "I check the weather, before you ask.",
  "Voulez-vous un peu de pluie avec ça? Ce soir?",
  "Smarter than your phone, and way less toxic.",
  "GPT-Powered Weather Alerts with a little profanity",
];

function App() {
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);

  // Geolocation state
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle|requesting|granted|denied|error|disabled
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState(null);

  // Session state
  const [sessionId, setSessionId] = useState(null);

  // Onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  // Guide / personality selection — drives both UI and backend tone
  const [selectedGuideId, setSelectedGuideId] = useState(
    () => localStorage.getItem("misterDonkeyGuide") || "default"
  );
  const selectedGuide = getDonkeyGuideById(selectedGuideId);
  // toneId maps the guide choice to the backend TONE_PRESETS key
  const selectedTone = selectedGuide.toneId;

  // Structured weather state powers theme, hourly forecast, mood image, and indicators.
  const [currentWeatherResult, setCurrentWeatherResult] = useState(null);
  const [autoWeatherLoading, setAutoWeatherLoading] = useState(false);
  const lastAutoMessageKeyRef = useRef(null);

  // PromptForm loading signal — lifted here only to drive the logo animation
  const [promptLoading, setPromptLoading] = useState(false);

  // Conversation history — the single visible report / chat panel.
  const [conversationHistory, setConversationHistory] = useState([]);

  // Apply weather theme whenever structured weather changes
  useEffect(() => {
    if (currentWeatherResult) {
      applyWeatherTheme(currentWeatherResult);
    } else {
      const root = document.documentElement;
      Object.entries(DEFAULT_THEME).forEach(([prop, val]) => root.style.setProperty(prop, val));
    }
  }, [currentWeatherResult]);

  const appendAutoWeatherMessage = useCallback((data, city, tone) => {
    const autoKey = `${city || "unknown"}|${tone || "default"}`;
    const content = data.text_summary || data.summary || "Weather data loaded.";
    if (!content || lastAutoMessageKeyRef.current === autoKey) return;
    lastAutoMessageKeyRef.current = autoKey;
    setConversationHistory(prev => [
      ...prev.filter(msg => msg.source !== "auto"),
      { role: "assistant", content, timestamp: Date.now(), source: "auto" },
    ]);
  }, []);

  const handlePromptStart = useCallback((userText) => {
    const now = Date.now();
    setConversationHistory(prev => [
      ...prev,
      { role: "user", content: userText, timestamp: now },
      { role: "assistant", content: "", timestamp: now, source: "stream", streaming: true },
    ]);
  }, []);

  const handleStreamUpdate = useCallback((assistantText) => {
    setConversationHistory(prev => {
      const next = [...prev];
      const idx = next.findLastIndex(msg => msg.role === "assistant" && msg.streaming);
      if (idx === -1) return next;
      next[idx] = { ...next[idx], content: assistantText, timestamp: Date.now() };
      return next;
    });
  }, []);

  const handlePromptComplete = useCallback((_userText, assistantText) => {
    setConversationHistory(prev => {
      const next = [...prev];
      const idx = next.findLastIndex(msg => msg.role === "assistant" && msg.streaming);
      if (idx === -1) return next;
      next[idx] = {
        ...next[idx],
        content: assistantText || next[idx].content,
        timestamp: Date.now(),
        streaming: false,
      };
      return next;
    });
  }, []);

  const handlePromptError = useCallback((message, requestId) => {
    setConversationHistory(prev => {
      const content = requestId ? `${message}\n\nDebug ID: ${requestId.slice(0, 8)}` : message;
      const next = [...prev];
      const idx = next.findLastIndex(msg => msg.role === "assistant" && msg.streaming);
      if (idx !== -1) {
        next[idx] = {
          ...next[idx],
          content,
          timestamp: Date.now(),
          source: "error",
          streaming: false,
        };
        return next;
      }
      return [
        ...prev,
        {
        role: "assistant",
        content,
        timestamp: Date.now(),
        source: "error",
        },
      ];
    });
  }, []);

  const randomTagline = donkeyTaglines[Math.floor(Math.random() * donkeyTaglines.length)];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist guide selection
  useEffect(() => {
    localStorage.setItem("misterDonkeyGuide", selectedGuideId);
  }, [selectedGuideId]);

  // 1) Session ID — create or restore from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mister_donkey_session_id");
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("mister_donkey_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  // 2) Geolocation — single source of truth
  const requestGeolocation = useCallback(() => {
    if (!geoEnabled) {
      setGeoStatus("disabled");
      return;
    }
    if (!("geolocation" in navigator)) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });
        setGeoStatus("granted");

        // Reverse geocode to get city name
        fetch(`${BASE_URL}/geo/reverse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.city) {
              setCityName(data.city);
            } else {
              console.warn("⚠️ Could not determine city");
            }
          })
          .catch((err) => {
            console.error("🛑 Reverse geocoding failed:", err);
          });
      },
      (err) => {
        console.warn("🛑 Geolocation error:", err);
        setGeoStatus(err.code === 1 ? "denied" : "error");
        setLocation(null);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [geoEnabled]);

  // Trigger geolocation once on mount (if enabled)
  useEffect(() => {
    if (geoEnabled) {
      requestGeolocation();
    } else {
      setGeoStatus("disabled");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Auto-weather fetch — fires once after location + city + session are ready
  const fetchAutoWeather = useCallback(async (loc, city, tone, sid) => {
    setAutoWeatherLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/prompt/structured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Hey Mister Donkey, what's the weather right now in ${city}?`,
          location: loc,
          tone,
          session_id: sid,
          auto: true,
        }),
      });
      const reqId = res.headers.get("X-Request-ID");
      if (reqId) console.log(`🔑 [${reqId}] auto-weather response received`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrentWeatherResult(data);
      appendAutoWeatherMessage(data, city, tone);
    } catch (err) {
      console.error("🐴 Auto weather fetch failed:", err);
    } finally {
      setAutoWeatherLoading(false);
    }
  }, [appendAutoWeatherMessage]);

  useEffect(() => {
    if (geoStatus === "granted" && location && cityName && sessionId) {
      fetchAutoWeather(location, cityName, selectedTone, sessionId);
    }
  }, [geoStatus, cityName, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const donkeyMoodDebug = currentWeatherResult ? getDonkeyMoodDebug(currentWeatherResult) : null;
  const donkeyMoodKey = donkeyMoodDebug?.moodKey || 'default';
  const donkeyMoodImage = DONKEY_MOOD_IMAGES[donkeyMoodKey] || DONKEY_MOOD_IMAGES.default || donkeyLogo;
  const moodDebugEnabled =
    import.meta.env.VITE_DEBUG_MOOD === "true" ||
    localStorage.getItem("md_debug_mood") === "true";

  const handleFavoriteSelect = useCallback((city) => {
    setCityName(city.name);
    setLocation({ lat: city.lat, lon: city.lon });
    if (sessionId) {
      fetchAutoWeather({ lat: city.lat, lon: city.lon }, city.name, selectedTone, sessionId);
    }
  }, [fetchAutoWeather, selectedTone, sessionId]);

  const handleGeoToggle = () => {
    const next = !geoEnabled;
    setGeoEnabled(next);
    if (!next) {
      setGeoStatus("disabled");
      setLocation(null);
      setCityName(null);
    } else {
      requestGeolocation();
    }
  };

  return (
    <>
    {showOnboarding && (
      <OnboardingModal
        selectedGuideId={selectedGuideId}
        onSelectGuide={setSelectedGuideId}
        onComplete={() => setShowOnboarding(false)}
      />
    )}
    <div className="page-wrapper">
      <div className="sidebar ad-left">
        <SupportCard
          variant="coffee"
          image={kofiCoffeeDonkey}
          href={KOFI_COFFEE_URL}
          title="Buy Donkey a Coffee"
          subtitle="Fuel the forecast."
          ariaLabel="Buy Donkey a Coffee on Ko-Fi"
        />
      </div>

      <div className="main-content">
        <div className="app-container">
          {!isOnline && (
            <div className="offline-banner" role="status" aria-live="polite">
              🐴 The donkey lost signal — check your connection
            </div>
          )}
          <img
            src={donkeyLogo}
            alt="Mister Donkey Logo"
            className={`logo${(autoWeatherLoading || promptLoading) ? ' loading' : ''}`}
          />
          <h1 className="title">weather from a jackass ❄️☀️</h1>
          <p className="subtitle">{randomTagline}</p>

          <GuideSelector
            selectedGuideId={selectedGuideId}
            onSelectGuide={setSelectedGuideId}
          />

          <GeoControls
            geoStatus={geoStatus}
            geoEnabled={geoEnabled}
            cityName={cityName}
            onRetry={requestGeolocation}
            onToggle={handleGeoToggle}
          />

          <FavoriteCities
            cityName={cityName}
            location={location}
            onSelectCity={handleFavoriteSelect}
          />

          {currentWeatherResult && (
            <>
            <img
              src={donkeyMoodImage}
              alt={`Mister Donkey mood: ${donkeyMoodKey}`}
              className="donkey-mood"
            />
            {moodDebugEnabled && donkeyMoodDebug && (
              <div className="mood-debug-panel">
                <div><strong>Mood:</strong> {donkeyMoodDebug.moodKey}</div>
                <div><strong>Image key:</strong> {donkeyMoodKey}</div>
                <div><strong>Rule:</strong> {donkeyMoodDebug.rule}</div>
                <div><strong>Condition:</strong> {donkeyMoodDebug.conditionMain || "n/a"} / {donkeyMoodDebug.conditionText || "n/a"}</div>
                <div><strong>Code:</strong> {String(donkeyMoodDebug.conditionCode ?? "n/a")}</div>
                <div><strong>Temp:</strong> {donkeyMoodDebug.tempC ?? "n/a"}°C</div>
                <div><strong>is_day:</strong> {String(donkeyMoodDebug.isDay ?? "n/a")}</div>
                <div><strong>Source:</strong> {donkeyMoodDebug.source}</div>
                <div className="mood-debug-grid" aria-label="Mood image preview grid">
                  {Object.entries(DONKEY_MOOD_IMAGES).map(([key, image]) => (
                    <div key={key} className="mood-debug-preview">
                      <img src={image} alt="" aria-hidden="true" />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
          )}

          {/* Auto-loaded weather result */}
          {autoWeatherLoading && (
            <SkeletonWeatherCard label="Loading automatic weather report" />
          )}

          {/* Hourly strip — sourced from the auto-weather structured response */}
          {currentWeatherResult?.weather?.hourly?.length > 0 && (
            <HourlyForecast hourly={currentWeatherResult.weather.hourly} />
          )}

          {currentWeatherResult?.weather && (
            <WeatherIndicators weather={currentWeatherResult.weather} />
          )}

          <ConversationHistory
            messages={conversationHistory}
            onClear={() => setConversationHistory([])}
          />

          <PromptForm
            location={location}
            cityName={cityName}
            selectedTone={selectedTone}
            sessionId={sessionId}
            onLoadingChange={setPromptLoading}
            onPromptStart={handlePromptStart}
            onStreamUpdate={handleStreamUpdate}
            onPromptComplete={handlePromptComplete}
            onPromptError={handlePromptError}
          />
        </div>

        <footer className="footer">
          Made by Doppler / Edward • <em>Powered by Mister Donkey</em>
        </footer>
      </div>

      <div className="sidebar ad-right">
        <SupportCard
          variant="beer"
          image={kofiBeerDonkey}
          href={KOFI_BEER_URL}
          title="Buy Donkey a Beer"
          subtitle="For after the storm."
          ariaLabel="Buy Donkey a Beer on Ko-Fi"
        />
      </div>
    </div>
    <PwaUpdateToast />
    </>
  );
}

export default App;
