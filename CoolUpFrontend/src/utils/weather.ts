const PARIS_LAT = 48.8566;
const PARIS_LNG = 2.3522;

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
  };
}

export async function fetchParisTemperature(): Promise<number> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${PARIS_LAT}&longitude=${PARIS_LNG}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');

  const data = (await res.json()) as OpenMeteoResponse;
  return data.current_weather.temperature;
}
