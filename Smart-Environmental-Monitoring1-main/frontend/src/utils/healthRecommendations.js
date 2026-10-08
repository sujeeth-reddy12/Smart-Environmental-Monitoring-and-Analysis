export function getHealthRecommendation(aqi) {
  if (aqi <= 50) {
    return {
      level: "Good",
      color: "#16a34a",
      icon: "🟢",
      advice: "Perfect day for outdoor activities.",
      groups: [
        "Children can safely play outside.",
        "Ideal for jogging and cycling.",
        "No precautions required."
      ]
    };
  }

  if (aqi <= 100) {
    return {
      level: "Moderate",
      color: "#eab308",
      icon: "🟡",
      advice: "Sensitive people should reduce prolonged outdoor exposure.",
      groups: [
        "Asthma patients should carry medication.",
        "Outdoor exercise is okay in moderation.",
        "Children should avoid heavy exertion."
      ]
    };
  }

  if (aqi <= 200) {
    return {
      level: "Poor",
      color: "#f97316",
      icon: "🟠",
      advice: "Limit outdoor activities.",
      groups: [
        "Wear an N95 mask.",
        "Avoid running outdoors.",
        "Keep windows closed."
      ]
    };
  }

  return {
    level: "Very Poor",
    color: "#dc2626",
    icon: "🔴",
    advice: "Avoid going outside unless necessary.",
    groups: [
      "Stay indoors.",
      "Use an air purifier if available.",
      "Avoid all strenuous outdoor activity."
    ]
  };
}