import { fetchWeatherApi } from "openmeteo";

const LOCATION_COORDS = {
  hunza: { latitude: 36.3167, longitude: 74.65, label: "Hunza" },
  skardu: { latitude: 35.2971, longitude: 75.6333, label: "Skardu" },
  swat: { latitude: 35.2227, longitude: 72.4258, label: "Swat" },
  naran: { latitude: 34.9039, longitude: 73.6501, label: "Naran" },
  gilgit: { latitude: 35.9208, longitude: 74.3144, label: "Gilgit" },
  chitral: { latitude: 35.8518, longitude: 71.7864, label: "Chitral" },
  fairy: { latitude: 35.381, longitude: 73.829, label: "Fairy Meadows" },
};

export function detectLocationInMessage(message = "") {
  const text = message.toLowerCase();
  return Object.entries(LOCATION_COORDS).find(([key]) => text.includes(key))?.[1] || null;
}

export async function getWeatherSnippet(location) {
  if (!location) return null;

  try {
    const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      current: ["temperature_2m", "weather_code", "wind_speed_10m"],
      daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      timezone: "auto",
      forecast_days: 3,
    };

    const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);
    const response = responses[0];
    const current = response.current();
    const daily = response.daily();

    if (!current || !daily) return null;

    const temp = current.variables(0)?.value();
    const tempMax = daily.variables(0)?.valuesArray()?.[0];
    const tempMin = daily.variables(1)?.valuesArray()?.[0];

    return `${location.label}: current ~${Math.round(temp)}°C, next days high ${Math.round(tempMax)}°C / low ${Math.round(tempMin)}°C. Mention weather briefly when planning outdoor days.`;
  } catch {
    return null;
  }
}
