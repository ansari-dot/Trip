import { useEffect, useState } from "react";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { CloudSun, Wind, Thermometer } from "lucide-react";

type WeatherData = {
  temperature: number;
  windSpeed: number;
};

export function useWeather(latitude?: number, longitude?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl(`/api/weather?latitude=${latitude}&longitude=${longitude}`));
        const data = await res.json();
        if (data?.success) {
          setWeather(data.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weather, loading };
}

export default function WeatherBadge({ latitude, longitude, compact = false }: { latitude?: number; longitude?: number; compact?: boolean }) {
  const { weather, loading } = useWeather(latitude, longitude);

  if (!latitude || !longitude) return null;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium shadow-lg">
        <CloudSun className="w-3.5 h-3.5" />
        <span>{Math.round(weather.temperature)}°C</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/90 via-cyan-500/90 to-teal-500/90 backdrop-blur-md border border-white/30 rounded-xl p-3 shadow-xl text-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-white/20 p-1.5 rounded-lg">
          <CloudSun className="w-5 h-5" />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-white/80">Current Weather</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-white/70" />
          <span className="text-2xl font-bold">{Math.round(weather.temperature)}°C</span>
        </div>
        <div className="h-6 w-px bg-white/30" />
        <div className="flex items-center gap-1.5 text-white/90">
          <Wind className="w-4 h-4" />
          <span className="text-sm">{Math.round(weather.windSpeed)} km/h</span>
        </div>
      </div>
    </div>
  );
}

