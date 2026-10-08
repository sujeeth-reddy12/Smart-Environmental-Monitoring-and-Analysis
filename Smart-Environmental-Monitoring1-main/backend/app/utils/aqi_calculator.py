def calculate_aqi(pm25: float, pm10: float) -> int:
    """
    AQI is calculated separately for PM2.5 and PM10.
    The overall AQI is the higher (worst) of the two sub-indices,
    following the CPCB AQI methodology.
    """

    def calculate_subindex(concentration, breakpoints):
        for bp_low, bp_high, aqi_low, aqi_high in breakpoints:
            if bp_low <= concentration <= bp_high:
                return round(
                    ((aqi_high - aqi_low) / (bp_high - bp_low))
                    * (concentration - bp_low)
                    + aqi_low
                )
        return 500

    pm25_breakpoints = [
        (0, 30, 0, 50),
        (30, 60, 50, 100),
        (60, 90, 100, 200),
        (90, 120, 200, 300),
        (120, 250, 300, 400),
        (250, 500, 400, 500),
    ]

    pm10_breakpoints = [
        (0, 50, 0, 50),
        (50, 100, 50, 100),
        (100, 250, 100, 200),
        (250, 350, 200, 300),
        (350, 430, 300, 400),
        (430, 600, 400, 500),
    ]

    pm25_aqi = calculate_subindex(pm25, pm25_breakpoints)
    pm10_aqi = calculate_subindex(pm10, pm10_breakpoints)

    return max(pm25_aqi, pm10_aqi)