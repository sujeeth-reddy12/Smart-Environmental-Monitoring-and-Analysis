# EcoPulse — REST API Contract & Specification

> Technical specification and developer reference for the EcoPulse REST API services. Developed for the EcoPulse Project.

---

## 📖 API Overview

The **EcoPulse API** provides RESTful HTTP endpoints for real-time ambient air quality monitoring, historical AQI analytics, machine learning prediction & multi-horizon forecasting, spatial map data rendering, and health risk alert advisories.

Built with **FastAPI**, the API accepts and returns JSON-formatted payloads, enforcing strict type safety via Pydantic schemas.

---

## 🌐 Base URL & Environments

| Environment | Base URL | Status |
| :--- | :--- | :--- |
| **Development** | `http://localhost:8000` | Active |
| **Production** | `https://api.ecopulse.app` | Planned |

---

## 📌 Versioning Strategy

All API routes follow URI path-based versioning prefixed with `/api/v1`.

```text
http://localhost:8000/api/v1/{resource}
```

Breaking changes will increment the major version number (e.g., `/api/v2`).

---

## 🔒 Authentication & Security


- **Future Production Roadmap**: Authentication via `Authorization: Bearer <JWT_TOKEN>` headers and API key rate-limiting middleware (`X-API-Key`).

---

## 📄 Standard Request & Response Formats

- **Content-Type**: `application/json`
- **Response Format**: All successful responses return a top-level JSON object containing a `"status": "success"` indicator alongside resource data.

---

## 🚦 HTTP Status Codes & Error Format

| Status Code | Meaning | Description |
| :---: | :--- | :--- |
| `200 OK` | Request Succeeded | Standard response for successful `GET` or `POST` requests. |
| `201 Created` | Resource Created | Successfully ingested air quality record or report. |
| `400 Bad Request` | Client Error | Missing parameters, invalid coordinates, or malformed JSON. |
| `404 Not Found` | Resource Not Found | Requested city, station ID, or endpoint does not exist. |
| `422 Unprocessable Entity` | Validation Error | Pydantic data validation failure on request parameters or body. |
| `500 Internal Server Error` | Server Error | Internal backend exception or database query failure. |
| `503 Service Unavailable` | External API Timeout | OpenWeather upstream service unavailable or timed out. |

### Standard Error Response Body

```json
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "The requested city 'UnknownCity' could not be found or geocoded.",
    "details": null,
    "timestamp": "2026-07-22T23:59:00Z"
  }
}
```

---

## 🔌 Endpoint Specifications

---

### 1. AQI Monitoring

#### `GET /api/v1/aqi/current`

- **Purpose**: Fetch current live AQI measurements, pollutant concentrations, and weather attributes for a specified city or coordinate location.
- **HTTP Method**: `GET`
- **Request Parameters**:

| Parameter | Type | In | Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| `city` | `string` | Query | Yes | Name of the target city (e.g., `Hyderabad`) |
| `latitude` | `float` | Query | No | Geographic latitude coordinate |
| `longitude` | `float` | Query | No | Geographic longitude coordinate |

##### Example Request
```http
GET /api/v1/aqi/current?city=Hyderabad&latitude=17.3850&longitude=78.4867 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "city": "Hyderabad",
    "coordinates": {
      "latitude": 17.3850,
      "longitude": 78.4867
    },
    "aqi": 128,
    "category": "Moderate",
    "pollutants": {
      "pm2_5": 42.5,
      "pm10": 85.0,
      "co": 0.8,
      "no2": 24.3,
      "so2": 12.1,
      "o3": 35.6
    },
    "weather": {
      "temperature": 29.5,
      "humidity": 62,
      "wind_speed": 4.2
    },
    "timestamp": "2026-07-22T23:59:00Z"
  }
}
```

---

### 2. Historical Analysis

#### `GET /api/v1/aqi/history`

- **Purpose**: Retrieve historical AQI time-series measurements for a city within a date range for charting and trend analysis.
- **HTTP Method**: `GET`
- **Request Parameters**:

| Parameter | Type | In | Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| `city` | `string` | Query | Yes | Target city name |
| `start_date` | `string` | Query | No | ISO 8601 start date (e.g., `2026-07-20T00:00:00Z`) |
| `end_date` | `string` | Query | No | ISO 8601 end date (e.g., `2026-07-22T23:59:59Z`) |
| `limit` | `integer` | Query | No | Maximum document count to return (default: `50`) |

##### Example Request
```http
GET /api/v1/aqi/history?city=Hyderabad&limit=3 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "city": "Hyderabad",
  "count": 3,
  "data": [
    {
      "timestamp": "2026-07-22T23:00:00Z",
      "aqi": 128,
      "category": "Moderate",
      "pm2_5": 42.5,
      "pm10": 85.0
    },
    {
      "timestamp": "2026-07-22T22:00:00Z",
      "aqi": 132,
      "category": "Moderate",
      "pm2_5": 45.1,
      "pm10": 89.2
    },
    {
      "timestamp": "2026-07-22T21:00:00Z",
      "aqi": 124,
      "category": "Moderate",
      "pm2_5": 40.8,
      "pm10": 82.4
    }
  ]
}
```

---

### 3. AQI Prediction

#### `POST /api/v1/prediction/aqi`

- **Purpose**: Accept live ambient pollutant and meteorological matrices to execute machine learning model inference and return future AQI predictions.
- **HTTP Method**: `POST`
- **Request Headers**: `Content-Type: application/json`

##### Example JSON Request Body
```json
{
  "city": "Hyderabad",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "pollutants": {
    "pm2_5": 42.5,
    "pm10": 85.0,
    "co": 0.8,
    "no2": 24.3,
    "so2": 12.1,
    "o3": 35.6
  },
  "weather": {
    "temperature": 29.5,
    "humidity": 62,
    "wind_speed": 4.2
  }
}
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "prediction": {
    "city": "Hyderabad",
    "predicted_aqi": 135.4,
    "pollution_category": "Unhealthy for Sensitive Groups",
    "forecast_time": "24h",
    "forecast_timestamp": "2026-07-23T23:59:00Z",
    "confidence_score": 0.91,
    "model_info": {
      "model_name": "RandomForestRegressor_AQI_v1",
      "algorithm": "Random Forest Regressor",
      "version": "1.0.0"
    }
  }
}
```

---

### 4. Interactive Map Data

#### `GET /api/v1/map/aqi-points`

- **Purpose**: Provide spatial AQI station data points (coordinates, current AQI score, and category) for Leaflet map marker rendering and hotspot visualization.
- **HTTP Method**: `GET`
- **Request Parameters**:

| Parameter | Type | In | Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| `bounds` | `string` | Query | No | Bounding box coordinates (`min_lat,min_lng,max_lat,max_lng`) |
| `category` | `string` | Query | No | Filter by pollution category (e.g., `Moderate`, `Unhealthy`) |

##### Example Request
```http
GET /api/v1/map/aqi-points HTTP/1.1
Host: localhost:8000
Accept: application/json
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "station_hyd_01",
      "name": "Hyderabad Central Station",
      "latitude": 17.3850,
      "longitude": 78.4867,
      "aqi": 128,
      "category": "Moderate",
      "updated_at": "2026-07-22T23:59:00Z"
    },
    {
      "id": "station_hyd_02",
      "name": "HITEC City Station",
      "latitude": 17.4435,
      "longitude": 78.3772,
      "aqi": 155,
      "category": "Unhealthy for Sensitive Groups",
      "updated_at": "2026-07-22T23:55:00Z"
    }
  ]
}
```

---

### 5. Pollution Alerts & Recommendations

#### `GET /api/v1/alerts`

- **Purpose**: Retrieve active pollution health warnings, severity assessment, and targeted health recommendations based on AQI values.
- **HTTP Method**: `GET`
- **Request Parameters**:

| Parameter | Type | In | Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| `city` | `string` | Query | Yes | Target city name |
| `aqi_level` | `integer` | Query | No | Optional AQI level override for previewing alerts |

##### Example Request
```http
GET /api/v1/alerts?city=Hyderabad HTTP/1.1
Host: localhost:8000
Accept: application/json
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "city": "Hyderabad",
  "aqi": 128,
  "severity": "Moderate",
  "alert_level": "WARNING",
  "general_recommendation": "Air quality is acceptable; however, sensitive individuals should limit prolonged outdoor exertion.",
  "group_advisories": {
    "children_and_elderly": "Reduce intense outdoor activities during peak afternoon hours.",
    "athletes": "Consider indoor workouts if experiencing minor throat irritation.",
    "general_public": "Keep windows closed during high-traffic rush hours."
  },
  "issued_at": "2026-07-22T23:59:00Z"
}
```

---

### 6. ML Model Information

#### `GET /api/v1/model/info`

- **Purpose**: Expose active machine learning model metadata, algorithms, input feature lists, and validation performance metrics.
- **HTTP Method**: `GET`

##### Example Request
```http
GET /api/v1/model/info HTTP/1.1
Host: localhost:8000
Accept: application/json
```

##### Example JSON Response (`200 OK`)
```json
{
  "status": "success",
  "active_models": [
    {
      "model_name": "AQI_Current_Estimator",
      "algorithm": "Random Forest Regressor",
      "version": "1.0.0",
      "features_used": [
        "pm2_5",
        "pm10",
        "no2",
        "so2",
        "co",
        "o3",
        "temperature",
        "humidity"
      ],
      "metrics": {
        "mae": 4.12,
        "rmse": 6.35,
        "r2_score": 0.94
      }
    },
    {
      "model_name": "AQI_24h_Forecaster",
      "algorithm": "Gradient Boosting Regressor",
      "version": "1.0.0",
      "features_used": [
        "pm2_5",
        "pm10",
        "historical_aqi_lag",
        "temperature",
        "wind_speed"
      ],
      "metrics": {
        "mae": 6.85,
        "rmse": 9.21,
        "r2_score": 0.89
      }
    }
  ]
}
```

---

## 🔮 Future Enhancements

- 🌐 **IoT Hardware Sensor Telemetry**: Ingestion endpoints for low-cost edge CAAQMS micro-controllers sending MQTT/REST packets.
- 🛰️ **Satellite Data Integration**: Spatial raster ingestion layer for Copernicus Sentinel-5P aerosol optical depth datasets.
- 🔑 **User Authentication & RBAC**: JWT Bearer token authentication with role-based access control for city admin privileges.
- 📢 **Citizen Pollution Reporting**: Endpoint for crowdsourced pollution incident flagging with photo attachments.
- 🩺 **Advanced AI Health Risk Index**: Personalized medical risk scoring based on user profile health conditions and cumulative exposure.

---

<div align="center">

**EcoPulse REST API Specification • EcoPulse Project**

*FastAPI • Python 3.10+ • MongoDB Atlas • OpenAPI 3.0*

</div>


