import { FaCloudSunRain, FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa'
import './WeatherCard.css'

function WeatherCard({ temperature, humidity, pressure, windSpeed }) {
  return (
    <article className="weather-card">
      <div className="weather-card__header">
        <p className="weather-card__label">Weather</p>
        <h3 className="weather-card__title">Current Conditions</h3>
      </div>

      <div className="weather-card__grid">
        <div className="weather-card__item">
          <span className="weather-card__icon"><FaThermometerHalf /></span>
          <div>
            <p className="weather-card__name">Temperature</p>
            <strong>{temperature}°C</strong>
          </div>
        </div>
        <div className="weather-card__item">
          <span className="weather-card__icon"><FaTint /></span>
          <div>
            <p className="weather-card__name">Humidity</p>
            <strong>{humidity}%</strong>
          </div>
        </div>
        <div className="weather-card__item">
          <span className="weather-card__icon"><FaCloudSunRain /></span>
          <div>
            <p className="weather-card__name">Pressure</p>
            <strong>{pressure} hPa</strong>
          </div>
        </div>
        <div className="weather-card__item">
          <span className="weather-card__icon"><FaWind /></span>
          <div>
            <p className="weather-card__name">Wind Speed</p>
            <strong>{windSpeed} m/s</strong>
          </div>
        </div>
      </div>
    </article>
  )
}

export default WeatherCard
