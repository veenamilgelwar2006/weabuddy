def analyze_weather(weather):

    temperature = float(weather.get("temperature", 25))
    feels_like = float(weather.get("feels_like", temperature))
    humidity = float(weather.get("humidity", 50))
    wind_speed = float(weather.get("wind_speed", 10))
    rain_chance = float(weather.get("rain_chance", 0))
    cloudiness = float(weather.get("cloudiness", 0))
    aqi = int(weather.get("aqi", 1))

    # -------------------------------------------------
    # WEATHER SCORE
    # -------------------------------------------------

    score = 100

    # Temperature
    if temperature >= 40:
        score -= 25
    elif temperature >= 35:
        score -= 18
    elif temperature >= 30:
        score -= 10
    elif temperature <= 5:
        score -= 20
    elif temperature <= 10:
        score -= 10

    # Rain
    if rain_chance >= 80:
        score -= 20
    elif rain_chance >= 60:
        score -= 15
    elif rain_chance >= 40:
        score -= 8

    # Humidity
    if humidity >= 85:
        score -= 10
    elif humidity >= 75:
        score -= 5

    # Strong wind
    if wind_speed >= 40:
        score -= 15
    elif wind_speed >= 25:
        score -= 8

    # Cloudiness
    if cloudiness >= 90:
        score -= 5

    score = max(0, min(100, score))

    # -------------------------------------------------
    # WEATHER CONDITION
    # -------------------------------------------------

    if score >= 80:
        condition = "Excellent"
    elif score >= 65:
        condition = "Good"
    elif score >= 45:
        condition = "Moderate"
    elif score >= 25:
        condition = "Poor"
    else:
        condition = "Unfavorable"

    # -------------------------------------------------
    # CLOTHING RECOMMENDATION
    # -------------------------------------------------

    if temperature >= 35:
        clothing = "Wear light, breathable and comfortable clothing."
    elif temperature >= 28:
        clothing = "Light cotton clothing is recommended."
    elif temperature >= 20:
        clothing = "Comfortable regular clothing should be suitable."
    elif temperature >= 12:
        clothing = "Consider wearing a light jacket or warm layer."
    else:
        clothing = "Wear warm clothing and consider an additional layer."

    # -------------------------------------------------
    # UMBRELLA RECOMMENDATION
    # -------------------------------------------------

    if rain_chance >= 70:
        umbrella = "Carry an umbrella. Rain is highly likely."
    elif rain_chance >= 40:
        umbrella = "Consider carrying an umbrella."
    else:
        umbrella = "An umbrella is probably not necessary."

    # -------------------------------------------------
    # ACTIVITY RECOMMENDATION
    # -------------------------------------------------

    if rain_chance >= 70:
        activity = "Indoor activities are recommended because of the high rain probability."
    elif temperature >= 38:
        activity = "Avoid strenuous outdoor activities during the hottest hours."
    elif temperature <= 10:
        activity = "Outdoor activities may require warm clothing."
    elif wind_speed >= 30:
        activity = "Choose activities with some protection from strong winds."
    else:
        activity = "Weather conditions are generally suitable for outdoor activities."

    # -------------------------------------------------
    # TRAVEL RECOMMENDATION
    # -------------------------------------------------

    if rain_chance >= 70:
        travel = "Allow extra travel time and be prepared for wet conditions."
    elif wind_speed >= 35:
        travel = "Travel carefully because of strong winds."
    elif temperature >= 38:
        travel = "Avoid unnecessary travel during peak afternoon heat."
    else:
        travel = "Travel conditions appear generally comfortable."

    # -------------------------------------------------
    # HYDRATION
    # -------------------------------------------------

    if temperature >= 35 or humidity >= 80:
        hydration = "Stay well hydrated, especially during outdoor activities."
    elif temperature >= 28:
        hydration = "Keep water with you and drink regularly."
    else:
        hydration = "Maintain normal hydration throughout the day."

    # -------------------------------------------------
    # SUN PROTECTION
    # -------------------------------------------------

    if temperature >= 30 and cloudiness < 70:
        sun_protection = "Use sun protection and avoid prolonged exposure during peak sunlight."
    elif cloudiness >= 80:
        sun_protection = "Cloud cover is high, but sun protection can still be useful."
    else:
        sun_protection = "Normal sun protection is recommended when outdoors."

    # -------------------------------------------------
    # AQI ANALYSIS
    # OpenWeather AQI scale:
    # 1 = Good
    # 2 = Fair
    # 3 = Moderate
    # 4 = Poor
    # 5 = Very Poor
    # -------------------------------------------------

    aqi_levels = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    }

    aqi_status = aqi_levels.get(aqi, "Unknown")

    if aqi <= 2:
        air_advice = "Air quality is generally suitable for normal outdoor activities."
    elif aqi == 3:
        air_advice = "Sensitive individuals may consider limiting prolonged outdoor exposure."
    else:
        air_advice = "Consider reducing prolonged outdoor activities due to poor air quality."

    # -------------------------------------------------
    # SMART DAILY BRIEFING
    # -------------------------------------------------

    if rain_chance >= 70:
        briefing = (
            "Rain is likely today. Carry an umbrella and plan outdoor activities carefully."
        )
    elif temperature >= 38:
        briefing = (
            "It is expected to be hot today. Stay hydrated and avoid prolonged exposure to heat."
        )
    elif temperature <= 10:
        briefing = (
            "The weather is cold today. Dress warmly and plan outdoor activities accordingly."
        )
    elif score >= 80:
        briefing = (
            "Today's weather looks favorable. It is a good time for normal outdoor activities."
        )
    else:
        briefing = (
            "Today's weather is moderate. Check the conditions before planning outdoor activities."
        )

    # -------------------------------------------------
    # RETURN ANALYSIS
    # -------------------------------------------------

    return {
        "weather_score": score,
        "condition": condition,

              "clothing": clothing,
        "umbrella": umbrella,
        "activity": activity,
        "travel": travel,
        "hydration": hydration,
        "sun_protection": sun_protection,

        "aqi_status": aqi_status,
        "air_advice": air_advice,

        "daily_briefing": briefing,

        "input": {
            "temperature": temperature,
            "feels_like": feels_like,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rain_chance": rain_chance,
            "cloudiness": cloudiness,
            "aqi": aqi
        }
    }