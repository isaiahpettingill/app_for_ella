import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import styles from './WeatherPage.module.css';
import unicornGif from '../../assets/unicorn.gif';
import sunGif from '../../assets/sun.gif';
import snowGif from '../../assets/snow.gif';
import rainGif from '../../assets/rain.gif';
import cloudsGif from '../../assets/clouds.gif';

const DEFAULT_LOCATION = { lat: 43.826, lon: -111.7897, name: 'Rexburg, Idaho' };

const weatherThresholds = [
  {
    type: 'rain',
    check: (data) => (data.precipitation ?? 0) > 0.1,
    summary: "It's rainy! Perfect weather for cozying up with a book or splashing in puddles. 🌧️"
  },
  {
    type: 'snow',
    check: (data) => (data.snowfall ?? 0) > 0.1,
    summary: "Snow is falling! Who ever heard of a skinny Santa?. ❄️"
  },
  {
    type: 'wind',
    check: (data) => (data.windSpeed ?? 0) > 30,
    summary: "It's windy! Is that a song?. 💨"
  },
  {
    type: 'sun',
    check: (data) => (data.weatherCode === 0),
    summary: "Clear skies! Today will be beautiful and bright like you. ☀️"
  },
  {
    type: 'cloud',
    check: (data) => [1,2,3].includes(data.weatherCode),
    summary: "Clouds! What a beautiful day to be a cloud. ☁️"
  },
  {
    type: 'default',
    check: () => true,
    summary: "You are beautiful no matter what the weather is. 🌈"
  }
];

const weatherGifs = {
  rain: rainGif,
  snow: snowGif,
  wind: null, // Add a wind gif here if available
  sun: sunGif, // Use sun.gif for sunny/clear
  cloud: cloudsGif,
  default: unicornGif, // fallback to unicorn for default
};

function getWeatherSummary(data) {
  for (const t of weatherThresholds) {
    if (t.check(data)) return t.summary;
  }
  return weatherThresholds[weatherThresholds.length - 1].summary;
}

function getWeatherType(data) {
  if (!data) return 'default';
  if ((data.precipitation ?? 0) > 0.1) return 'rain';
  if ((data.snowfall ?? 0) > 0.1) return 'snow';
  if ((data.windSpeed ?? 0) > 30) return 'wind';
  if (data.weatherCode === 0) return 'sun';
  if ([1,2,3].includes(data.weatherCode)) return 'cloud';
  return 'default';
}

export const WeatherPage = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchWeather(lat, lon) {
      setLoading(true);
      setError(null);
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation,snowfall,weathercode,windspeed_10m&timezone=auto`)
        .then(res => res.json())
        .then(data => {
          if (!data.current_weather) throw new Error('No weather data');
          // Find the current hour index
          const now = new Date();
          const hourIdx = data.hourly.time.findIndex(t => t.startsWith(now.toISOString().slice(0, 13)));
          setWeather({
            temp: data.current_weather.temperature,
            windSpeed: data.current_weather.windspeed,
            weatherCode: data.current_weather.weathercode,
            precipitation: data.hourly.precipitation[hourIdx],
            snowfall: data.hourly.snowfall[hourIdx],
            time: data.current_weather.time,
          });
          setLoading(false);
        })
        .catch(e => {
          setError('Could not fetch weather.');
          setLoading(false);
        });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Your Location' });
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setLocation(DEFAULT_LOCATION);
          fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
  }, []);

  let summary = weather ? getWeatherSummary(weather) : '';
  let gifType = weather ? getWeatherType(weather) : 'default';
  let gifSrc = weatherGifs[gifType];

  return (
    <div className={styles.weatherContainer}>
      <h1 className={styles.title}>Weather</h1>
      <div className={styles.card}>
        {loading && <div className={styles.loading}>Loading weather...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {weather && !loading && !error && (
          <>
            <div className={styles.location}>{location.name}</div>
            <div className={styles.temp}>{Math.round(weather.temp)}°C</div>
            <div className={styles.details}>
              <span>Wind: {Math.round(weather.windSpeed)} km/h</span>
              <span>Precip: {weather.precipitation ? weather.precipitation.toFixed(1) : 0} mm</span>
              <span>Snow: {weather.snowfall ? weather.snowfall.toFixed(1) : 0} mm</span>
            </div>
            <div className={styles.summary}>{summary}</div>
            {gifSrc && (
              <img src={gifSrc} alt={gifType + ' gif'} className={styles.weatherGif} />
            )}
          </>
        )}
      </div>
    </div>
  );
}; 