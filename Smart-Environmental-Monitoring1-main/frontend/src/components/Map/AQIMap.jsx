import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import PollutionHotspots from './PollutionHotspots'
import './AQIMap.css'


function AQIMap({
  city = 'Hyderabad',
  aqi = 78,
  category = 'Moderate',
  coordinates = [17.3850, 78.4867],
  hotspots = [],
}) {
  const cityName = city || 'Hyderabad'
  const aqiValue = Number(aqi) || 78
  const categoryName = category || 'Moderate'
  const getMarkerColor = (aqi) => {
    if (aqi <= 50) return "#22c55e";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 200) return "#f97316";
    if (aqi <= 300) return "#ef4444";
    if (aqi <= 400) return "#9333ea";
    return "#7f1d1d";
  };

  const markerColor = getMarkerColor(aqi);

  const cityIcon = L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:${markerColor};
          border:3px solid white;
          box-shadow:0 0 0 6px ${markerColor}33;
        ">
      </div>
    `,
    iconSize: [18, 18],
  });
  return (
    <div className="aqi-map-card">
      <div className="aqi-map-card__header">
        <div>
          <p className="aqi-map-card__eyebrow">Air Quality Map</p>
          <h3 className="aqi-map-card__title">AQI Overview</h3>
        </div>
        <span className="aqi-map-card__badge">{cityName}</span>
      </div>

      <div className="aqi-map-card__summary">
        <span>City: {cityName}</span>
        <span>AQI: {aqiValue}</span>
        <span>Category: {categoryName}</span>
      </div>

      <div className="aqi-map-card__map">
        <MapContainer
          className="aqi-map"
          center={coordinates}
          zoom={11}
          scrollWheelZoom={false}
        >
        <div className="aqi-map-legend">
          <div><span className="legend-dot good"></span> Good</div>
          <div><span className="legend-dot satisfactory"></span> Satisfactory</div>
          <div><span className="legend-dot moderate"></span> Moderate</div>
          <div><span className="legend-dot poor"></span> Poor</div>
          <div><span className="legend-dot verypoor"></span> Very Poor</div>
          <div><span className="legend-dot severe"></span> Severe</div>
        </div>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coordinates} icon={cityIcon}>
            <Popup>
              <div className="aqi-map-popup">
                <h4>📍 {cityName}</h4>

                <p><strong>AQI:</strong> {aqiValue}</p>

                <p>
                  <strong>Category:</strong> {categoryName}
                </p>

                <hr />

                <small>
                  Live environmental monitoring
                </small>
              </div>
            </Popup>
          </Marker>
          <PollutionHotspots hotspots={hotspots} />
        </MapContainer>
      </div>
    </div>
  )
}

export default AQIMap
