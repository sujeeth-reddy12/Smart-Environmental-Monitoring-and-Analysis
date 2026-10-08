const BASE_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const session = JSON.parse(localStorage.getItem("ecopulse_session") || "null");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    if (response.status === 401) {
      window.dispatchEvent(new Event("ecopulse-auth-expired"));
    }
    throw new Error(error || "Request failed");
  }

  return response.json();
}

export const register = ({ name, email, password }) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  request("/auth/logout", { method: "POST" });

// AQI APIs
export const getLatestAQI = (city) => request(`/aqi/latest?city=${city}`);

export const getAQIHistory = (city, limit = 10) =>
  request(
    `/aqi/history?city=${encodeURIComponent(city)}&limit=${limit}`
  );

export const collectEnvironmentalData = (city) =>
  request(`/aqi/collect?city=${encodeURIComponent(city)}`, {
    method: "POST",
  });

// Prediction APIs
export const getPrediction = (city) =>
  request(`/prediction/all?city=${encodeURIComponent(city)}`);

export const getCurrentPrediction = (city) =>
  request(`/prediction/current?city=${encodeURIComponent(city)}`);

export const getForecastPrediction = (city) =>
  request(`/prediction/forecast?city=${encodeURIComponent(city)}`);

export const getLatestEnvironment = (city) =>
  request(`/environment/latest?city=${encodeURIComponent(city)}`);

export const refreshEnvironment = (city) =>
  request(`/environment/refresh?city=${encodeURIComponent(city)}`, { method: "POST" });

export const searchLocations = (query) =>
  request(`/locations/search?q=${encodeURIComponent(query)}`);

export const createPrediction = (parameters) =>
  request("/predict", {
    method: "POST",
    body: JSON.stringify(parameters),
  });

export const getPredictionHistory = (limit = 20) =>
  request(`/prediction/history?limit=${limit}`);

export const getModelComparison = () => request("/model/comparison");

export const compareLocations = (cities) =>
  request(`/locations/compare?${cities.map((city) => `cities=${encodeURIComponent(city)}`).join('&')}`);

export const getLocationRanking = () => request('/locations/ranking');
