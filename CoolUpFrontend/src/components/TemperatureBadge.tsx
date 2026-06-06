import { useEffect, useState } from 'react';
import { fetchParisTemperature } from '../utils/weather';

const REFRESH_MS = 10 * 60 * 1000;

export default function TemperatureBadge() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const temp = await fetchParisTemperature();
        if (!cancelled) setTemperature(temp);
      } catch {
        if (!cancelled) setTemperature(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const label = loading
    ? '🌡 Paris —°'
    : temperature !== null
      ? `🌡 Paris ${Math.round(temperature)}°`
      : '🌡 Paris —°';

  return (
    <div className="flex items-center bg-app_green text-white px-5 py-2.5 rounded-full gap-2 font-medium text-sm shadow-sm">
      <span>{label}</span>
    </div>
  );
}
