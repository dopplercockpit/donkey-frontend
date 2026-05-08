function asNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asBool(value) {
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  return null;
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function hasUsableCurrent(current) {
  if (!isObject(current)) return false;
  return [
    "conditions",
    "condition_main",
    "condition_code",
    "conditions_code",
    "temp_c",
    "wind_kph",
    "wind_speed_kmh",
    "wind_ms",
    "wind_speed_ms",
    "visibility_km",
    "visibility_m",
    "source",
  ].some((key) => current[key] !== undefined && current[key] !== null && current[key] !== "");
}

function getStructuredCurrent(result) {
  const current = result?.weather?.current;
  return hasUsableCurrent(current) ? current : null;
}

function getFallbackCurrent(result) {
  const current = result?.current ?? result?.data?.current;
  return hasUsableCurrent(current) ? current : null;
}

function buildCurrentConditionText(current) {
  const code = current?.condition_code;
  return [
    current?.conditions,
    current?.condition_main,
    typeof code === "string" ? code : null,
    current?.conditions_code,
    current?.condition,
    current?.weather?.[0]?.main,
    current?.weather?.[0]?.description,
  ].filter(Boolean).join(" ").toLowerCase();
}

function buildFallbackConditionText(result) {
  const current = getFallbackCurrent(result);
  if (current) return buildCurrentConditionText(current);
  return [
    result?.condition,
    result?.weatherMain,
    result?.description,
    result?.text_summary,
    result?.summary,
  ].filter(Boolean).join(" ").toLowerCase();
}

function getConditionCode(current) {
  const raw = current?.condition_code ?? current?.conditions_code;
  const numeric = asNumber(raw);
  return numeric ?? raw ?? null;
}

function isWeatherApiCode(code) {
  return asNumber(code) !== null && asNumber(code) >= 1000;
}
function isOpenWeatherCode(code, source) {
  const numeric = asNumber(code);
  return numeric !== null && (source === "openweather" || numeric < 1000);
}

function inRange(code, min, max) {
  const numeric = asNumber(code);
  return numeric !== null && numeric >= min && numeric <= max;
}

function isWeatherApiRain(code) {
  const numeric = asNumber(code);
  return numeric === 1063
    || numeric === 1072
    || inRange(numeric, 1150, 1201)
    || inRange(numeric, 1240, 1246);
}

function isWeatherApiSnow(code) {
  const numeric = asNumber(code);
  return numeric === 1066
    || numeric === 1069
    || numeric === 1114
    || numeric === 1117
    || inRange(numeric, 1204, 1237)
    || inRange(numeric, 1249, 1264);
}

function isWeatherApiThunder(code) {
  const numeric = asNumber(code);
  return numeric === 1087 || inRange(numeric, 1273, 1282);
}

function isWeatherApiFog(code) {
  const numeric = asNumber(code);
  return numeric === 1030 || numeric === 1135 || numeric === 1147;
}

function isWeatherApiClear(code) {
  return asNumber(code) === 1000;
}

function isWeatherApiCloud(code) {
  const numeric = asNumber(code);
  return numeric === 1003 || numeric === 1006 || numeric === 1009;
}

function isOpenWeatherClear(code, source) {
  return isOpenWeatherCode(code, source) && asNumber(code) === 800;
}

function isOpenWeatherCloud(code, source) {
  return isOpenWeatherCode(code, source) && inRange(code, 801, 804);
}

function deriveMood(details) {
  const {
    conditionText,
    conditionCode,
    tempC,
    windKph,
    windMs,
    visibilityKm,
    isDay,
    source,
    fallbackProse,
  } = details;
  const codeString = typeof conditionCode === "string" ? conditionCode.toLowerCase() : "";

  const afterStormText = /after storm|rainbow|clearing|partly clear after rain/.test(conditionText);
  if (afterStormText) return { moodKey: "after_storm", rule: fallbackProse ? "fallback_prose_after_storm" : "text_after_storm" };

  const thunderCode = isOpenWeatherCode(conditionCode, source) && inRange(conditionCode, 200, 299)
    || isWeatherApiThunder(conditionCode);
  if (/thunder|lightning|thunderstorm|storm/.test(conditionText) || thunderCode) {
    return { moodKey: "thunder", rule: thunderCode ? "code_thunder" : "text_thunder" };
  }

  const snowCode = isOpenWeatherCode(conditionCode, source) && inRange(conditionCode, 600, 699)
    || isWeatherApiSnow(conditionCode);
  if (/snow|sleet|ice pellets|freezing rain|frost/.test(conditionText) || snowCode) {
    return { moodKey: "snowy", rule: snowCode ? "code_snowy" : "text_snowy" };
  }

  const fogCode = isOpenWeatherCode(conditionCode, source) && inRange(conditionCode, 700, 799)
    || isWeatherApiFog(conditionCode);
  if (/fog|mist|haze|smoke|low visibility/.test(conditionText) || fogCode || (visibilityKm !== null && visibilityKm <= 2)) {
    return { moodKey: "foggy", rule: fogCode ? "code_foggy" : "text_or_visibility_foggy" };
  }

  if (/hot|heatwave/.test(conditionText) || (tempC !== null && tempC >= 30)) {
    return { moodKey: "hot", rule: tempC !== null && tempC >= 30 ? "temp_hot" : "text_hot" };
  }

  if (/chilly|cool/.test(conditionText) || (tempC !== null && tempC > 0 && tempC <= 12)) {
    return { moodKey: "chilly", rule: tempC !== null && tempC <= 12 ? "temp_chilly" : "text_chilly" };
  }

  if (/wind|gust|blustery/.test(conditionText) || (windMs !== null && windMs >= 10) || (windKph !== null && windKph >= 36)) {
    return { moodKey: "windy", rule: "windy" };
  }

  const rainCode = isOpenWeatherCode(conditionCode, source) && (inRange(conditionCode, 300, 399) || inRange(conditionCode, 500, 599))
    || isWeatherApiRain(conditionCode);
  if (/rain|drizzle|shower|precipitation/.test(conditionText) || rainCode) {
    return { moodKey: "rainy", rule: rainCode ? "code_rainy" : "text_rainy" };
  }

  const clearCode = isOpenWeatherClear(conditionCode, source) || isWeatherApiClear(conditionCode);
  const cloudCode = isOpenWeatherCloud(conditionCode, source) || isWeatherApiCloud(conditionCode);
  const mildNight = isDay === false
    && tempC !== null
    && tempC >= 12
    && tempC <= 25
    && (/clear|sunny|partly cloudy|cloudy|overcast/.test(conditionText) || clearCode || cloudCode);
  if (mildNight) {
    return { moodKey: "pleasant_night", rule: clearCode ? "code_clear_pleasant_night" : "text_or_cloud_pleasant_night" };
  }

  if (/clear|sunny/.test(conditionText) || clearCode || codeString === "clear") {
    return {
      moodKey: "sunny",
      rule: clearCode && isOpenWeatherCode(conditionCode, source)
        ? "code_openweather_clear"
        : clearCode
          ? "code_weatherapi_clear"
          : "text_sunny",
    };
  }

  return { moodKey: "default", rule: fallbackProse ? "fallback_prose" : "default" };
}

export function getDonkeyMoodDebug(result) {
  const structuredCurrent = getStructuredCurrent(result);
  const fallbackCurrent = structuredCurrent ? null : getFallbackCurrent(result);
  const current = structuredCurrent ?? fallbackCurrent;
  const fallbackProse = !structuredCurrent && !fallbackCurrent;
  const conditionText = current ? buildCurrentConditionText(current) : buildFallbackConditionText(result);
  const conditionCode = current ? getConditionCode(current) : null;
  const conditionMain = current?.condition_main ?? current?.conditions_code ?? "";
  const tempC = asNumber(current?.temp_c ?? current?.temp ?? result?.temperature ?? result?.temp);
  const windKph = asNumber(current?.wind_kph ?? current?.wind_speed_kmh);
  const windMs = asNumber(
    current?.wind_ms
    ?? current?.wind_speed_ms
    ?? (windKph !== null ? windKph / 3.6 : null)
    ?? current?.wind_speed
    ?? current?.windSpeed
  );
  const visibilityKm = asNumber(
    current?.visibility_km
    ?? (current?.visibility_m !== undefined && current?.visibility_m !== null ? Number(current.visibility_m) / 1000 : null)
  );
  const isDay = asBool(current?.is_day);
  const source = current?.source || (structuredCurrent ? "structured_current" : fallbackCurrent ? "fallback_current" : "fallback_prose");
  const derived = deriveMood({
    conditionText,
    conditionCode,
    tempC,
    windKph,
    windMs,
    visibilityKm,
    isDay,
    source,
    fallbackProse,
  });

  return {
    moodKey: derived.moodKey,
    rule: fallbackProse ? "fallback_prose" : derived.rule,
    conditionText,
    conditionCode,
    conditionMain,
    tempC,
    windKph,
    windMs,
    visibilityKm,
    isDay,
    source,
  };
}

export function getDonkeyMoodKey(result) {
  return getDonkeyMoodDebug(result).moodKey;
}
