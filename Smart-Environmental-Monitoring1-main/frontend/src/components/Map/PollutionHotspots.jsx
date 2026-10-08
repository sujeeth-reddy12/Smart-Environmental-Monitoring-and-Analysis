import { CircleMarker, Popup } from 'react-leaflet'
import './AQIMap.css'

function PollutionHotspots({ hotspots = [] }) {
  const getColor = (aqi) => {
    if (aqi <= 50) return "#22c55e";      // Green (Good)
    if (aqi <= 100) return "#eab308";     // Yellow (Satisfactory)
    if (aqi <= 200) return "#f97316";     // Orange (Moderate)
    if (aqi <= 300) return "#ef4444";     // Red (Poor)
    if (aqi <= 400) return "#9333ea";     // Purple (Very Poor)
    return "#7f1d1d";                     // Maroon (Severe)
  };

  return (
    <>
      {hotspots.map((spot) => {
        const radius = Math.max(8, Math.min(22, 8 + Math.round(spot.aqi / 20)))
        return (
          <CircleMarker
            key={spot.name}
            center={spot.coordinates}
            radius={radius}
            pathOptions={{ color: getColor(spot.aqi), fillColor: getColor(spot.aqi), fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="aqi-map-popup">
                <h4>📍 {spot.name}</h4>

                <p><strong>AQI:</strong> {spot.aqi}</p>

                <p>
                  <strong>Category:</strong> {spot.category}
                </p>

                <hr />

                <small>Environmental hotspot</small>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export default PollutionHotspots
