/* =========================================================
   WEABUDDY
   Intelligent Weather Recommendation Chatbot
   HTML + CSS + JavaScript + OpenWeather API + Flask
========================================================= */


/* =========================================================
   1. CONFIGURATION
========================================================= */

const API_KEY = "06cfae743d8acb7cd67d5937bf04aef7";

const CURRENT_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

const GEO_API =
    "https://api.openweathermap.org/geo/1.0/direct";

const AIR_API =
    "https://api.openweathermap.org/data/2.5/air_pollution";


/*
   Python Flask Backend
*/
const FLASK_API = "";


/* =========================================================
   2. APPLICATION STATE
========================================================= */

let currentWeather = null;
let currentForecast = null;
let currentAirQuality = null;
let currentPythonAnalysis = null;
let currentCity = "";

let currentUnit =
    localStorage.getItem("weabuddyUnit") || "metric";

let favorites = JSON.parse(
    localStorage.getItem("weabuddyFavorites") || "[]"
);


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const searchSuggestions =
    document.getElementById("searchSuggestions");

const favoritesRow =
    document.getElementById("favoritesRow");

const unitToggle =
    document.getElementById("unitToggle");

const themeToggle =
    document.getElementById("themeToggle");

const locationButton =
    document.getElementById("locationButton");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const closeError =
    document.getElementById("closeError");

const weatherDashboard =
    document.getElementById("weatherDashboard");

const cityName =
    document.getElementById("cityName");

const favoriteButton =
    document.getElementById("favoriteButton");

const locationCountry =
    document.getElementById("locationCountry");

const localTime =
    document.getElementById("localTime");

const currentDate =
    document.getElementById("currentDate");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike =
    document.getElementById("feelsLike");

const weatherIcon =
    document.getElementById("weatherIcon");

const maxTemp =
    document.getElementById("maxTemp");

const minTemp =
    document.getElementById("minTemp");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const windDirection =
    document.getElementById("windDirection");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");

const cloudiness =
    document.getElementById("cloudiness");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const rainChance =
    document.getElementById("rainChance");

const clothingTitle =
    document.getElementById("clothingTitle");

const clothingText =
    document.getElementById("clothingText");

const umbrellaTitle =
    document.getElementById("umbrellaTitle");

const umbrellaText =
    document.getElementById("umbrellaText");

const activityTitle =
    document.getElementById("activityTitle");

const activityText =
    document.getElementById("activityText");

const travelTitle =
    document.getElementById("travelTitle");

const travelText =
    document.getElementById("travelText");

const hydrationTitle =
    document.getElementById("hydrationTitle");

const hydrationText =
    document.getElementById("hydrationText");

const sunTitle =
    document.getElementById("sunTitle");

const sunText =
    document.getElementById("sunText");

const aqiTitle =
    document.getElementById("aqiTitle");

const aqiDescription =
    document.getElementById("aqiDescription");

const aqiValue =
    document.getElementById("aqiValue");

const forecastGrid =
    document.getElementById("forecastGrid");

const chatWindow =
    document.getElementById("chatWindow");

const chatInput =
    document.getElementById("chatInput");

const sendMessage =
    document.getElementById("sendMessage");

const clearChat =
    document.getElementById("clearChat");


/* =========================================================
   4. INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateUnitButton();

    loadTheme();

    renderFavorites();

    setupQuickQuestions();

    setupEventListeners();

    const lastCity =
        localStorage.getItem("weabuddyLastCity");

    loadWeatherByCity(
        lastCity || "Nagpur"
    );
});


/* =========================================================
   5. EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchCity
        );
    }

    if (cityInput) {

        cityInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    searchCity();
                }
            }
        );

        cityInput.addEventListener(
            "input",
            debounce(
                handleCitySuggestions,
                400
            )
        );
    }

    if (locationButton) {

        locationButton.addEventListener(
            "click",
            getCurrentLocation
        );
    }

    if (unitToggle) {

        unitToggle.addEventListener(
            "click",
            toggleUnit
        );
    }

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            toggleTheme
        );
    }

    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            toggleFavorite
        );
    }

    if (closeError) {

        closeError.addEventListener(
            "click",
            hideError
        );
    }

    if (sendMessage) {

        sendMessage.addEventListener(
            "click",
            sendChatMessage
        );
    }

    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    sendChatMessage();
                }
            }
        );
    }

    if (clearChat) {

        clearChat.addEventListener(
            "click",
            clearChatMessages
        );
    }

    document.addEventListener(
        "click",
        event => {

            if (
                searchSuggestions &&
                !searchSuggestions.contains(event.target) &&
                event.target !== cityInput
            ) {

                searchSuggestions.innerHTML = "";
            }
        }
    );
}


/* =========================================================
   6. SEARCH CITY
========================================================= */

async function searchCity() {

    if (!cityInput) return;

    const city =
        cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    await loadWeatherByCity(city);
}


/* =========================================================
   7. LOAD WEATHER BY CITY
========================================================= */

async function loadWeatherByCity(city) {

    if (!city) return;

    if (!isAPIReady()) {

        showError(
            "Please add your OpenWeather API key in script.js."
        );

        return;
    }

    showLoading();

    hideError();

    currentPythonAnalysis = null;

    try {

        const url =
            `${CURRENT_API}?q=${encodeURIComponent(city)}` +
            `&appid=${API_KEY}` +
            `&units=${currentUnit}`;

        const response =
            await fetch(url);

        if (!response.ok) {

            await handleAPIError(
                response.status
            );

            return;
        }

        const weather =
            await response.json();

        currentWeather =
            weather;

        currentCity =
            weather.name;

        const lat =
            weather.coord.lat;

        const lon =
            weather.coord.lon;

        await loadAdditionalWeather(
            lat,
            lon
        );

        updateDashboard();

        /*
           Send weather information to Python
        */
        await loadPythonWeatherAnalysis();

        if (weatherDashboard) {

            weatherDashboard.classList.remove(
                "hidden"
            );
        }

        if (cityInput) {

            cityInput.value =
                weather.name;
        }

        saveLastCity(
            weather.name
        );

        updateFavoriteButton();

        refreshBotGreeting();

    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        showError(
            error.message ||
            "Unable to load weather information."
        );

    } finally {

        hideLoading();
    }
}


/* =========================================================
   8. ADDITIONAL WEATHER DATA
========================================================= */

async function loadAdditionalWeather(
    lat,
    lon
) {

    currentForecast = null;

    currentAirQuality = null;

    try {

        const forecastURL =
            `${FORECAST_API}?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}` +
            `&units=${currentUnit}`;

        const airURL =
            `${AIR_API}?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}`;

        const [
            forecastResponse,
            airResponse
        ] =
            await Promise.all([
                fetch(forecastURL),
                fetch(airURL)
            ]);

        if (forecastResponse.ok) {

            currentForecast =
                await forecastResponse.json();
        }

        if (airResponse.ok) {

            currentAirQuality =
                await airResponse.json();
        }

    } catch (error) {

        console.warn(
            "Additional weather data unavailable:",
            error
        );
    }
}


/* =========================================================
   9. LOAD WEATHER BY COORDINATES
========================================================= */

async function loadWeatherByCoordinates(
    lat,
    lon
) {

    if (!isAPIReady()) {

        showError(
            "Please add your OpenWeather API key in script.js."
        );

        return;
    }

    showLoading();

    hideError();

    currentPythonAnalysis = null;

    try {

        const url =
            `${CURRENT_API}?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}` +
            `&units=${currentUnit}`;

        const response =
            await fetch(url);

        if (!response.ok) {

            await handleAPIError(
                response.status
            );

            return;
        }

        const weather =
            await response.json();

        currentWeather =
            weather;

        currentCity =
            weather.name;

        await loadAdditionalWeather(
            lat,
            lon
        );

        updateDashboard();

        /*
           Send location weather information to Python
        */
        await loadPythonWeatherAnalysis();

        if (weatherDashboard) {

            weatherDashboard.classList.remove(
                "hidden"
            );
        }

        if (cityInput) {

            cityInput.value =
                weather.name;
        }

        saveLastCity(
            weather.name
        );

        updateFavoriteButton();

        refreshBotGreeting();

    } catch (error) {

        console.error(
            "Location weather error:",
            error
        );

        showError(
            error.message ||
            "Unable to load weather for your location."
        );

    } finally {

        hideLoading();
    }
}


/* =========================================================
   10. UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    if (!currentWeather) return;

    const weather =
        currentWeather;

    const main =
        weather.main;

    const wind =
        weather.wind;

    const info =
        weather.weather[0];

    setText(
        cityName,
        weather.name
    );

    setText(
        locationCountry,
        weather.sys?.country || ""
    );

    setText(
        temperature,
        `${Math.round(main.temp)}°`
    );

    setText(
        feelsLike,
        `Feels like ${Math.round(main.feels_like)}°`
    );

    setText(
        weatherDescription,
        capitalize(info.description)
    );

    if (weatherIcon) {

        weatherIcon.src =
            `https://openweathermap.org/img/wn/${info.icon}@2x.png`;

        weatherIcon.alt =
            info.description;
    }

    setText(
        maxTemp,
        `${Math.round(main.temp_max)}°`
    );

    setText(
        minTemp,
        `${Math.round(main.temp_min)}°`
    );

    setText(
        humidity,
        `${main.humidity}%`
    );

    setText(
        windSpeed,
        formatWindSpeed(
            wind.speed
        )
    );

    setText(
        windDirection,
        getWindDirection(
            wind.deg
        )
    );

    setText(
        pressure,
        `${main.pressure} hPa`
    );

    setText(
        visibility,
        weather.visibility
            ? `${(
                weather.visibility / 1000
            ).toFixed(1)} km`
            : "N/A"
    );

    setText(
        cloudiness,
        `${weather.clouds?.all ?? 0}%`
    );

    setText(
        sunrise,
        formatTime(
            weather.sys.sunrise
        )
    );

    setText(
        sunset,
        formatTime(
            weather.sys.sunset
        )
    );

    setText(
        rainChance,
        `${getRainChance()}%`
    );

    updateLocalTime();

    /*
       Existing JavaScript recommendation system
       remains as the immediate fallback.
    */
    updateRecommendations();

    updateAirQuality();

    updateForecast();
}


/* =========================================================
   11. PYTHON FLASK WEATHER ANALYSIS
========================================================= */

async function loadPythonWeatherAnalysis() {

    if (!currentWeather) {

        return null;
    }

    const weather =
        currentWeather;

    const rain =
        getRainChance();

    const aqi =
        currentAirQuality?.list?.[0]?.main?.aqi || 1;

    const weatherData = {

        temperature:
            weather.main.temp,

        feels_like:
            weather.main.feels_like,

        humidity:
            weather.main.humidity,

        wind_speed:
            weather.wind?.speed || 0,

        rain_chance:
            rain,

        cloudiness:
            weather.clouds?.all || 0,

        aqi:
            aqi
    };


    console.log(
        "Sending weather data to Python:",
        weatherData
    );


    try {

        const response =
            await fetch(
                `${FLASK_API}/api/analyze`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            weatherData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                `Python server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        console.log(
            "WeaBuddy Python Analysis:",
            result
        );


        if (
            result.status === "success" &&
            result.data
        ) {

            currentPythonAnalysis =
                result.data;


            updatePythonRecommendations(
                result.data
            );


            console.log(
                "🤖 Python Weather Score:",
                result.data.weather_score
            );


            console.log(
                "📝 Python Daily Briefing:",
                result.data.daily_briefing
            );


            return result.data;
        }


        return null;

    } catch (error) {

        /*
           IMPORTANT:
           Flask failure should NOT break WeaBuddy.
           Existing JavaScript recommendations remain active.
        */

        console.warn(
            "Python backend unavailable. Using JavaScript recommendations.",
            error
        );

        currentPythonAnalysis =
            null;

        return null;
    }
}


/* =========================================================
   12. APPLY PYTHON RECOMMENDATIONS
========================================================= */

function updatePythonRecommendations(
    analysis
) {

    if (!analysis) return;


    console.log(
        "🤖 Applying Python recommendations:",
        analysis
    );


    /*
       CLOTHING
    */

    setRecommendation(
        clothingTitle,
        "AI Clothing Advice 👕"
    );

    setRecommendation(
        clothingText,
        analysis.clothing
    );


    /*
       UMBRELLA
    */

    setRecommendation(
        umbrellaTitle,
        analysis.umbrella
    );

    setRecommendation(
        umbrellaText,
        `Rain indicator: ${analysis.input.rain_chance}%`
    );


    /*
       ACTIVITY
    */

    setRecommendation(
        activityTitle,
        `AI Outdoor Score: ${analysis.weather_score}/100`
    );

    setRecommendation(
        activityText,
        analysis.activity
    );


    /*
       TRAVEL
    */

    setRecommendation(
        travelTitle,
        analysis.condition
    );

    setRecommendation(
        travelText,
        analysis.travel
    );


    /*
       HYDRATION
    */

    setRecommendation(
        hydrationTitle,
        "Smart Hydration Advice 💧"
    );

    setRecommendation(
        hydrationText,
        analysis.hydration
    );


    /*
       SUN
    */

    setRecommendation(
        sunTitle,
        "AI Sun Protection ☀️"
    );

    setRecommendation(
        sunText,
        analysis.sun_protection
    );
}


/* =========================================================
   13. WEATHER SCORES
========================================================= */

function calculateWeatherScores() {

    if (!currentWeather) {

        return {
            outdoor: 0,
            travel: 0,
            comfort: 0,
            rainRisk: 0
        };
    }


    /*
       If Python analysis is available,
       use its main weather score as the
       outdoor score.
    */

    if (
        currentPythonAnalysis &&
        typeof currentPythonAnalysis.weather_score ===
            "number"
    ) {

        const pythonScore =
            clamp(
                Math.round(
                    currentPythonAnalysis.weather_score
                ),
                0,
                100
            );


        return {

            outdoor:
                pythonScore,

            travel:
                pythonScore,

            comfort:
                pythonScore,

            rainRisk:
                clamp(
                    getRainChance(),
                    0,
                    100
                )
        };
    }


    /*
       JavaScript fallback scoring
    */

    const weather =
        currentWeather;

    const temp =
        weather.main.temp;

    const humidityValue =
        weather.main.humidity;

    const wind =
        weather.wind.speed;

    const weatherId =
        weather.weather[0].id;

    const rainRisk =
        getRainChance();

    let outdoor = 100;

    let travel = 100;

    let comfort = 100;


    if (temp < 5) {

        outdoor -= 35;
        travel -= 20;
        comfort -= 40;

    } else if (temp < 15) {

        outdoor -= 15;
        comfort -= 15;

    } else if (temp > 38) {

        outdoor -= 40;
        travel -= 15;
        comfort -= 35;

    } else if (temp > 32) {

        outdoor -= 20;
        comfort -= 20;
    }


    if (humidityValue > 80) {

        outdoor -= 15;
        comfort -= 20;

    } else if (humidityValue > 65) {

        outdoor -= 8;
        comfort -= 10;
    }


    if (wind > 12) {

        outdoor -= 20;
        travel -= 10;

    } else if (wind > 8) {

        outdoor -= 10;
    }


    if (rainRisk >= 70) {

        outdoor -= 45;
        travel -= 30;

    } else if (rainRisk >= 40) {

        outdoor -= 25;
        travel -= 15;

    } else if (rainRisk >= 20) {

        outdoor -= 10;
    }


    if (
        weatherId >= 200 &&
        weatherId < 600
    ) {

        outdoor -= 25;
        travel -= 20;

    } else if (
        weatherId >= 600 &&
        weatherId < 700
    ) {

        outdoor -= 30;
        travel -= 20;

    } else if (
        weatherId >= 700 &&
        weatherId < 800
    ) {

        outdoor -= 10;
        travel -= 5;
    }


    if (currentAirQuality?.list?.[0]) {

        const aqi =
            currentAirQuality.list[0].main.aqi;

        if (aqi >= 4) {

            outdoor -= 25;
            comfort -= 15;

        } else if (aqi === 3) {

            outdoor -= 10;
        }
    }


    return {

        outdoor:
            clamp(
                Math.round(outdoor),
                0,
                100
            ),

        travel:
            clamp(
                Math.round(travel),
                0,
                100
            ),

        comfort:
            clamp(
                Math.round(comfort),
                0,
                100
            ),

        rainRisk:
            clamp(
                rainRisk,
                0,
                100
            )
    };
}


/* =========================================================
   14. RECOMMENDATIONS
========================================================= */

function updateRecommendations() {

    if (!currentWeather) return;

    const weather =
        currentWeather;

    const temp =
        weather.main.temp;

    const humidityValue =
        weather.main.humidity;

    const weatherId =
        weather.weather[0].id;

    const rain =
        getRainChance();

    const veryHot =
        temp >= 35;

    const hot =
        temp >= 28;

    const cold =
        temp <= 12;

    const pleasant =
        temp > 18 &&
        temp < 28;


    const clothing =
        getClothingAdvice(
            temp,
            humidityValue,
            weatherId
        );


    setRecommendation(
        clothingTitle,
        clothing.title
    );

    setRecommendation(
        clothingText,
        clothing.text
    );


    if (rain >= 60) {

        setRecommendation(
            umbrellaTitle,
            "Definitely carry one ☔"
        );

        setRecommendation(
            umbrellaText,
            "Rain is quite likely in the upcoming forecast period."
        );

    } else if (rain >= 30) {

        setRecommendation(
            umbrellaTitle,
            "Better to carry one ☔"
        );

        setRecommendation(
            umbrellaText,
            "There is a chance of rain, so an umbrella could be useful."
        );

    } else {

        setRecommendation(
            umbrellaTitle,
            "Probably not needed"
        );

        setRecommendation(
            umbrellaText,
            "Rain chances are currently low."
        );
    }


    const scores =
        calculateWeatherScores();


    if (scores.outdoor >= 80) {

        setRecommendation(
            activityTitle,
            "Great for outdoors 🌤️"
        );

        setRecommendation(
            activityText,
            "The weather looks comfortable for outdoor activities."
        );

    } else if (scores.outdoor >= 60) {

        setRecommendation(
            activityTitle,
            "Good with some care"
        );

        setRecommendation(
            activityText,
            "Outdoor activities are possible, but keep an eye on changing weather."
        );

    } else {

        setRecommendation(
            activityTitle,
            "Consider staying indoors"
        );

        setRecommendation(
            activityText,
            "Current conditions are not ideal for longer outdoor activities."
        );
    }


    if (scores.travel >= 80) {

        setRecommendation(
            travelTitle,
            "Good for travelling 🚗"
        );

        setRecommendation(
            travelText,
            "Weather conditions look favorable for travel."
        );

    } else if (scores.travel >= 60) {

        setRecommendation(
            travelTitle,
            "Travel is possible"
        );

        setRecommendation(
            travelText,
            "Travel should be fine, but keep an eye on the forecast."
        );

    } else {

        setRecommendation(
            travelTitle,
            "Travel with caution"
        );

        setRecommendation(
            travelText,
            "Weather conditions may make travel less comfortable."
        );
    }


    if (veryHot) {

        setRecommendation(
            hydrationTitle,
            "Stay well hydrated 💧"
        );

        setRecommendation(
            hydrationText,
            "Hot conditions can increase your need for fluids."
        );

    } else if (
        hot ||
        humidityValue > 75
    ) {

        setRecommendation(
            hydrationTitle,
            "Keep water nearby 💧"
        );

        setRecommendation(
            hydrationText,
            "Warm or humid conditions make regular hydration helpful."
        );

    } else {

        setRecommendation(
            hydrationTitle,
            "Normal hydration"
        );

        setRecommendation(
            hydrationText,
            "Keep drinking water regularly throughout the day."
        );
    }


    if (veryHot) {

        setRecommendation(
            sunTitle,
            "Strong heat ☀️"
        );

        setRecommendation(
            sunText,
            "Avoid spending too long in direct sunlight during the hottest part of the day."
        );

    } else if (pleasant) {

        setRecommendation(
            sunTitle,
            "Nice weather ☀️"
        );

        setRecommendation(
            sunText,
            "Comfortable conditions for enjoying some daylight."
        );

    } else if (cold) {

        setRecommendation(
            sunTitle,
            "Cool conditions"
        );

        setRecommendation(
            sunText,
            "The temperature is on the cooler side today."
        );

    } else {

        setRecommendation(
            sunTitle,
            "Moderate conditions"
        );

        setRecommendation(
            sunText,
            "Enjoy the daylight while staying comfortable."
        );
    }
}


/* =========================================================
   15. AIR QUALITY
========================================================= */

function updateAirQuality() {

    if (!currentAirQuality?.list?.[0]) {

        setText(
            aqiValue,
            "N/A"
        );

        setText(
            aqiTitle,
            "Air quality unavailable"
        );

        setText(
            aqiDescription,
            "Air quality information could not be loaded."
        );

        return;
    }


    const aqi =
        currentAirQuality.list[0].main.aqi;

    const information =
        getAQIInformation(aqi);


    setText(
        aqiValue,
        aqi
    );

    setText(
        aqiTitle,
        information.title
    );

    setText(
        aqiDescription,
        information.description
    );
}


function getAQIInformation(aqi) {

    const data = {

        1: {
            title: "Good",
            description:
                "Air quality is good and generally suitable for outdoor activities."
        },

        2: {
            title: "Fair",
            description:
                "Air quality is acceptable for most people."
        },

        3: {
            title: "Moderate",
            description:
                "Sensitive people may want to reduce prolonged outdoor activity."
        },

        4: {
            title: "Poor",
            description:
                "Consider reducing prolonged outdoor activity."
        },

        5: {
            title: "Very Poor",
            description:
                "Outdoor exposure may be uncomfortable."
        }
    };


    return data[aqi] || {

        title: "Unknown",

        description:
            "Air quality information unavailable."
    };
}


/* =========================================================
   16. FORECAST
========================================================= */

function updateForecast() {

    if (!forecastGrid) return;


    if (!currentForecast?.list) {

        forecastGrid.innerHTML =
            "<p>Forecast unavailable.</p>";

        return;
    }


    const dailyForecasts =
        getDailyForecasts();


    forecastGrid.innerHTML =
        dailyForecasts
            .map(day => {

                return `
                    <div class="forecast-card">

                        <div class="forecast-day">
                            ${escapeHTML(day.day)}
                        </div>

                        <img
                            src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                            alt="${escapeHTML(day.description)}"
                        >

                        <div class="forecast-temp">
                            ${Math.round(day.temp)}°
                        </div>

                        <div class="forecast-description">
                            ${escapeHTML(
                                capitalize(day.description)
                            )}
                        </div>

                        <div class="forecast-extra">
                            💧 ${day.humidity}%
                        </div>

                    </div>
                `;

            })
            .join("");
}


function getDailyForecasts() {

    if (!currentForecast?.list) {

        return [];
    }


    const grouped = {};


    currentForecast.list.forEach(
        item => {

            const date =
                new Date(
                    item.dt * 1000
                ).toLocaleDateString(
                    "en-CA"
                );


            if (!grouped[date]) {

                grouped[date] = [];
            }


            grouped[date].push(item);
        }
    );


    return Object.entries(grouped)
        .slice(0, 5)
        .map(
            ([date, items]) => {

                const middle =
                    items[
                        Math.floor(
                            items.length / 2
                        )
                    ];


                return {

                    day:
                        new Date(
                            date + "T12:00:00"
                        ).toLocaleDateString(
                            undefined,
                            {
                                weekday: "short"
                            }
                        ),

                    temp:
                        middle.main.temp,

                    icon:
                        middle.weather[0].icon,

                    description:
                        middle.weather[0].description,

                    humidity:
                        middle.main.humidity
                };
            }
        );
}


/* =========================================================
   17. CITY SUGGESTIONS
========================================================= */

async function handleCitySuggestions() {

    if (
        !cityInput ||
        !searchSuggestions
    ) {

        return;
    }


    const query =
        cityInput.value.trim();


    if (query.length < 2) {

        searchSuggestions.innerHTML =
            "";

        return;
    }


    if (!isAPIReady()) return;


    try {

        const url =
            `${GEO_API}?q=${encodeURIComponent(query)}` +
            `&limit=5` +
            `&appid=${API_KEY}`;


        const response =
            await fetch(url);


        if (!response.ok) return;


        const cities =
            await response.json();


        searchSuggestions.innerHTML =
            cities
                .map(city => {

                    return `
                        <div
                            class="search-suggestion"
                            data-city="${escapeHTML(city.name)}"
                        >

                            <strong>
                                ${escapeHTML(city.name)}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    city.state || ""
                                )}

                                ${
                                    city.country
                                        ? ", " +
                                          escapeHTML(
                                              city.country
                                          )
                                        : ""
                                }
                            </span>

                        </div>
                    `;

                })
                .join("");


        document
            .querySelectorAll(
                ".search-suggestion"
            )
            .forEach(item => {

                item.addEventListener(
                    "click",
                    () => {

                        const city =
                            item.dataset.city;

                        cityInput.value =
                            city;

                        searchSuggestions.innerHTML =
                            "";

                        loadWeatherByCity(
                            city
                        );
                    }
                );
            });


    } catch (error) {

        console.warn(
            "City suggestions unavailable:",
            error
        );
    }
}


/* =========================================================
   18. CURRENT LOCATION
========================================================= */

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        position => {

            loadWeatherByCoordinates(
                position.coords.latitude,
                position.coords.longitude
            );
        },

        error => {

            console.error(
                "Location error:",
                error
            );

            hideLoading();


            showError(
                "Unable to access your location. Please allow location permission or search for a city manually."
            );
        }
    );
}


/* =========================================================
   19. FAVORITES
========================================================= */

function toggleFavorite() {

    if (!currentCity) return;


    const index =
        favorites.findIndex(
            city =>
                city.toLowerCase() ===
                currentCity.toLowerCase()
        );


    if (index >= 0) {

        favorites.splice(
            index,
            1
        );

    } else {

        favorites.push(
            currentCity
        );
    }


    localStorage.setItem(
        "weabuddyFavorites",
        JSON.stringify(favorites)
    );


    renderFavorites();

    updateFavoriteButton();
}


function renderFavorites() {

    if (!favoritesRow) return;


    if (favorites.length === 0) {

        favoritesRow.innerHTML =
            "";

        return;
    }


    favoritesRow.innerHTML =
        favorites
            .map(city => {

                return `
                    <button
                        class="favorite-city"
                        data-city="${escapeHTML(city)}"
                    >
                        ⭐ ${escapeHTML(city)}
                    </button>
                `;

            })
            .join("");


    favoritesRow
        .querySelectorAll(
            ".favorite-city"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    loadWeatherByCity(
                        button.dataset.city
                    );
                }
            );
        });
}


function updateFavoriteButton() {

    if (!favoriteButton) return;


    const isFavorite =
        favorites.some(
            city =>
                city.toLowerCase() ===
                currentCity.toLowerCase()
        );


    favoriteButton.innerHTML =
        isFavorite
            ? "★"
            : "☆";


    favoriteButton.title =
        isFavorite
            ? "Remove from favorites"
            : "Add to favorites";
}


/* =========================================================
   20. UNITS
========================================================= */

function toggleUnit() {

    currentUnit =
        currentUnit === "metric"
            ? "imperial"
            : "metric";


    localStorage.setItem(
        "weabuddyUnit",
        currentUnit
    );


    updateUnitButton();


    if (currentCity) {

        loadWeatherByCity(
            currentCity
        );
    }
}


function updateUnitButton() {

    if (!unitToggle) return;


    unitToggle.textContent =
        currentUnit === "metric"
            ? "°C"
            : "°F";
}


function getTemperatureUnit() {

    return currentUnit === "metric"
        ? "°C"
        : "°F";
}


function formatWindSpeed(speed) {

    if (currentUnit === "metric") {

        return `${speed.toFixed(1)} m/s`;
    }


    return `${speed.toFixed(1)} mph`;
}


/* =========================================================
   21. THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "weabuddyTheme",
        darkMode
            ? "dark"
            : "light"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "weabuddyTheme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );
    }
}


/* =========================================================
   22. LOCAL TIME
========================================================= */

function updateLocalTime() {

    if (!currentWeather) return;


    const timezoneOffset =
        currentWeather.timezone || 0;


    const utcNow =
        Date.now() +
        new Date().getTimezoneOffset() *
        60000;


    const cityDate =
        new Date(
            utcNow +
            timezoneOffset * 1000
        );


    if (localTime) {

        localTime.textContent =
            cityDate.toLocaleTimeString(
                undefined,
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    }


    if (currentDate) {

        currentDate.textContent =
            cityDate.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            );
    }
}


/* =========================================================
   23. WEATHER HELPERS
========================================================= */

function getWindDirection(degrees) {

    if (
        degrees === undefined ||
        degrees === null
    ) {

        return "N/A";
    }


    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];


    const index =
        Math.round(
            degrees / 45
        ) % 8;


    return directions[index];
}


function formatTime(timestamp) {

    if (!timestamp) {

        return "N/A";
    }


    return new Date(
        timestamp * 1000
    ).toLocaleTimeString(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function getRainChance() {

    if (
        currentForecast &&
        currentForecast.list
    ) {

        const periods =
            currentForecast.list.slice(
                0,
                8
            );


        let maximum = 0;


        periods.forEach(
            period => {

                const probability =
                    (period.pop || 0) *
                    100;


                maximum =
                    Math.max(
                        maximum,
                        probability
                    );
            }
        );


        return Math.round(
            maximum
        );
    }


    if (
        currentWeather &&
        currentWeather.rain
    ) {

        return 80;
    }


    return 10;
}


/* =========================================================
   24. CHATBOT
========================================================= */

function setupQuickQuestions() {

    document
        .querySelectorAll(
            "[data-question]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const question =
                        button.dataset.question;


                    if (chatInput) {

                        chatInput.value =
                            question;
                    }


                    sendChatMessage();
                }
            );
        });
}


function sendChatMessage() {

    if (
        !chatInput ||
        !chatWindow
    ) {

        return;
    }


    const message =
        chatInput.value.trim();


    if (!message) return;


    addUserMessage(
        message
    );


    chatInput.value =
        "";


    const response =
        processChatMessage(
            message
        );


    setTimeout(
        () => {

            addBotMessage(
                response
            );

        },
        350
    );
}


/* =========================================================
   MAIN CHATBOT
========================================================= */

function processChatMessage(message) {

    const text =
        message
            .toLowerCase()
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    /* GREETING */

    if (
        /\b(hi|hello|hey|hii|hiii)\b/
            .test(text)
    ) {

        return currentCity

            ? `Hey! 👋 I'm WeaBuddy AI. I'm ready to help you understand the weather in ${currentCity}. 🌤️`

            : "Hey! 👋 I'm WeaBuddy AI. Ask me anything about the weather.";
    }


    /* THANKS */

    if (
        /\b(thanks|thank you|thankyou|thx)\b/
            .test(text)
    ) {

        return "You're welcome! 😊 I'm always here whenever you need a quick weather update.";
    }


    /* HELP */

    if (
        /\b(help|commands|features)\b/
            .test(text) ||
        text.includes(
            "what can you do"
        )
    ) {

        return `
🤖 WEABUDDY AI

I can help you with:

🌤️ Current weather
🌡️ Temperature
☔ Rain & umbrella
👕 Clothing
🏃 Outdoor activities
🏏 Sports & exercise
🧺 Picnic suitability
🚗 Travel
💧 Hydration
☀️ Sun protection
💨 Wind
🧭 Wind direction
💧 Humidity
🌿 AQI / air quality
👀 Visibility
☁️ Cloudiness
🌅 Sunrise & sunset
🕐 Local time
📅 Forecast
⭐ Weather score

Try asking:

"What should I wear?"
"Will it rain?"
"Can I go cycling?"
"Is it good for a picnic?"
"Is it good for travelling?"
"What is the AQI?"
"What is tomorrow's weather?"
        `;
    }


    /* TOMORROW */

    if (
        text.includes(
            "tomorrow"
        ) ||
        text.includes(
            "next day"
        )
    ) {

        return getTomorrowForecast();
    }


    /* FORECAST */

    if (
        /\b(forecast|next few days|5 day|five day|weekly)\b/
            .test(text)
    ) {

        return getForecastChatSummary();
    }


    /* BEST DAY */

    if (
        text.includes(
            "best day"
        ) ||
        text.includes(
            "which day is best"
        )
    ) {

        return getBestForecastDay();
    }


    /* MAXIMUM */

    if (
        /\b(maximum|max temp|highest temperature|highest temp)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
🌡️ Maximum Temperature

Today's maximum temperature in ${currentCity} is approximately ${Math.round(currentWeather.main.temp_max)}${getTemperatureUnit()}.
        `;
    }


    /* MINIMUM */

    if (
        /\b(minimum|min temp|lowest temperature|lowest temp)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
🌡️ Minimum Temperature

Today's minimum temperature in ${currentCity} is approximately ${Math.round(currentWeather.main.temp_min)}${getTemperatureUnit()}.
        `;
    }


    /* TEMPERATURE */

    if (
        /\b(temperature|temp|hot|cold|heat|feels like)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const temp =
            Math.round(
                currentWeather.main.temp
            );


        const feels =
            Math.round(
                currentWeather.main.feels_like
            );


        return `
🌡️ Temperature in ${currentCity}

Current: ${temp}${getTemperatureUnit()}
Feels like: ${feels}${getTemperatureUnit()}
Minimum: ${Math.round(currentWeather.main.temp_min)}${getTemperatureUnit()}
Maximum: ${Math.round(currentWeather.main.temp_max)}${getTemperatureUnit()}

${
    temp >= 35
        ? "☀️ It's quite hot. Lightweight clothing and regular hydration may help."
        : temp <= 15
            ? "🧥 It's relatively cool. A light warm layer may be useful."
            : "😊 The temperature looks fairly comfortable."
}
        `;
    }


    /* CLOTHING */

    if (
        /\b(wear|clothes|clothing|dress|outfit|jacket|shirt|sweater|raincoat)\b/
            .test(text) ||
        text.includes(
            "what should i wear"
        ) ||
        text.includes(
            "what to wear"
        )
    ) {

        return getClothingAdviceText();
    }


    /* RAIN */

    if (
        /\b(rain|raining|rainy|umbrella|drizzle|showers)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const rain =
            getRainChance();


        if (rain >= 70) {

            return `
☔ Rain Alert

Rain chance indicator: ${rain}%

Rain looks quite likely in the upcoming forecast period. Carrying an umbrella would be a good idea.
            `;

        } else if (rain >= 40) {

            return `
🌦️ Possible Rain

Rain chance indicator: ${rain}%

There is a reasonable possibility of rain, so carrying an umbrella could be useful.
            `;

        } else {

            return `
☀️ Low Rain Risk

Rain chance indicator: ${rain}%

Rain doesn't look very likely in the upcoming forecast period.
            `;
        }
    }


    /* PICNIC */

    if (
        /\b(picnic|park|garden)\b/
            .test(text)
    ) {

        const score =
            calculateWeatherScores()
                .outdoor;


        const rain =
            getRainChance();


        if (
            score >= 75 &&
            rain < 30
        ) {

            return `
🧺 Picnic Recommendation

Yes! The conditions look suitable for a picnic. 😊

Outdoor score: ${score}/100
Rain chance indicator: ${rain}%
            `;
        }


        return `
🧺 Picnic Recommendation

The weather isn't ideal for a picnic right now.

Outdoor score: ${score}/100
Rain chance indicator: ${rain}%

You may want to choose a more comfortable time.
        `;
    }


    /* SPORTS */

    if (
        /\b(sport|sports|football|cricket|running|cycling|exercise|game)\b/
            .test(text)
    ) {

        const score =
            calculateWeatherScores()
                .outdoor;


        if (score >= 80) {

            return `
🏃 Sports & Exercise

Outdoor suitability: ${score}/100 ⭐

The weather looks favorable for outdoor activity.
            `;

        } else if (score >= 60) {

            return `
🙂 Sports & Exercise

Outdoor suitability: ${score}/100

Outdoor activity is possible, but conditions aren't perfect.
            `;
        }


        return `
⚠️ Sports & Exercise

Outdoor suitability: ${score}/100

The current weather isn't ideal for longer outdoor activity.
        `;
    }


    /* OUTDOOR */

    if (
        /\b(outdoor|outside|activity|activities|walking|photography|college|school)\b/
            .test(text)
    ) {

        const score =
            calculateWeatherScores()
                .outdoor;


        return `
🏃 Outdoor Activity

Suitability: ${score}/100

${
    score >= 80
        ? "The weather looks great for outdoor activities!"
        : score >= 60
            ? "Outdoor activities should be okay, but keep an eye on changing conditions."
            : "The weather isn't ideal for longer outdoor activities right now."
}
        `;
    }


    /* TRAVEL */

    if (
        /\b(travel|trip|journey|drive|driving|travelling|traveling)\b/
            .test(text)
    ) {

        const score =
            calculateWeatherScores()
                .travel;


        const rain =
            getRainChance();


        return `
🚗 Travel Recommendation

Travel score: ${score}/100
Rain chance indicator: ${rain}%

${
    score >= 80
        ? "Travel conditions look good! ⭐"
        : score >= 60
            ? "Travel should be possible, but keep an eye on the weather."
            : "Weather conditions may make travelling less comfortable."
}
        `;
    }


    /* HUMIDITY */

    if (
        /\b(humidity|humid|moisture)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const humidityValue =
            currentWeather.main.humidity;


        return `
💧 Humidity in ${currentCity}

Current humidity: ${humidityValue}%

${
    humidityValue >= 80
        ? "The air is quite humid."
        : humidityValue >= 60
            ? "Humidity is moderate."
            : "Humidity is relatively low."
}
        `;
    }


    /* WIND DIRECTION */

    if (
        text.includes(
            "wind direction"
        ) ||
        text.includes(
            "which direction is the wind"
        )
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
🧭 Wind Direction

The wind is currently from the ${getWindDirection(currentWeather.wind.deg)} direction.
        `;
    }


    /* WIND */

    if (
        /\b(wind|windy|breeze)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
💨 Wind Information

Speed: ${formatWindSpeed(currentWeather.wind.speed)}
Direction: ${getWindDirection(currentWeather.wind.deg)}

${
    currentWeather.wind.speed >= 10
        ? "🌬️ Winds are relatively strong."
        : "🍃 Winds are fairly calm."
}
        `;
    }


    /* PRESSURE */

    if (
        /\b(pressure|atmospheric pressure)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
🌡️ Atmospheric Pressure

Pressure in ${currentCity}: ${currentWeather.main.pressure} hPa
        `;
    }


    /* VISIBILITY */

    if (
        /\b(visibility|visible|fog|mist)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const value =
            currentWeather.visibility
                ? (
                    currentWeather.visibility /
                    1000
                ).toFixed(1)
                : "N/A";


        return `
👀 Visibility

Current visibility in ${currentCity}: ${value} km

${
    Number(value) < 5
        ? "⚠️ Visibility is reduced."
        : "✅ Visibility looks reasonably clear."
}
        `;
    }


    /* CLOUDS */

    if (
        /\b(cloud|clouds|cloudy|cloudiness|overcast)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const clouds =
            currentWeather.clouds?.all ?? 0;


        return `
☁️ Cloud Coverage

Cloudiness in ${currentCity}: ${clouds}%

${
    clouds >= 80
        ? "The sky is mostly cloudy."
        : clouds >= 40
            ? "There are some noticeable clouds."
            : "The sky is relatively clear."
}
        `;
    }


    /* AQI */

    if (
        /\b(aqi|air quality|pollution|polluted)\b/
            .test(text)
    ) {

        if (!currentAirQuality?.list?.[0]) {

            return "🌿 Air quality information is currently unavailable.";
        }


        const aqi =
            currentAirQuality.list[0]
                .main.aqi;


        const information =
            getAQIInformation(aqi);


        return `
🌿 Air Quality

Status: ${information.title}
AQI level: ${aqi}/5

${information.description}
        `;
    }


    /* HYDRATION */

    if (
        /\b(hydration|hydrate|water|thirsty)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const temp =
            currentWeather.main.temp;


        const humidityValue =
            currentWeather.main.humidity;


        return `
💧 Hydration Reminder

Temperature: ${Math.round(temp)}${getTemperatureUnit()}
Humidity: ${humidityValue}%

${
    temp >= 32 ||
    humidityValue >= 80
        ? "It's relatively warm or humid, so remember to drink water regularly."
        : "The weather isn't especially hot, but staying hydrated is still a good habit."
}
        `;
    }


    /* SUN */

    if (
        /\b(sun|sunny|sunscreen|sunglasses|sunlight|uv)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        const clouds =
            currentWeather.clouds?.all ?? 0;


        return clouds < 40

            ? `
☀️ Sun Protection

The sky is relatively clear today.

If you're outside, consider shade, sunglasses and appropriate sun protection.
            `

            : `
🌤️ Sun Protection

There is noticeable cloud cover today, but sunlight can still reach you.

Reasonable sun protection can still be useful outdoors.
            `;
    }


    /* SUNRISE / SUNSET */

    if (
        /\b(sunrise|sunset|sun rise|sun set)\b/
            .test(text)
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        return `
🌅 Sun Information

Sunrise: ${formatTime(currentWeather.sys.sunrise)}
Sunset: ${formatTime(currentWeather.sys.sunset)}
        `;
    }


    /* LOCAL TIME */

    if (
        text.includes("local time") ||
        text.includes("current time") ||
        text.includes("what time")
    ) {

        if (!currentWeather) {

            return "I need the current weather data first. 🌤️";
        }


        updateLocalTime();


        return `
🕐 Local Time

The current local time in ${currentCity} is ${localTime?.textContent || "unavailable"}.

📅 ${currentDate?.textContent || ""}
        `;
    }


    /* LOCATION */

    if (
        /\b(where am i|my location|which city|current city)\b/
            .test(text)
    ) {

        return currentCity

            ? `📍 You're currently viewing weather information for ${currentCity}.`

            : "📍 Your current weather location isn't available yet.";
    }


    /* WEATHER SCORE */

    if (
        /\b(score|rating|suitable|suitability|good weather)\b/
            .test(text)
    ) {

        const scores =
            calculateWeatherScores();


        let pythonExtra = "";


        if (
            currentPythonAnalysis &&
            currentPythonAnalysis.condition
        ) {

            pythonExtra =
                `\n🤖 AI Condition: ${currentPythonAnalysis.condition}`;
        }


        return `
⭐ WeaBuddy Weather Score

🏃 Outdoor: ${scores.outdoor}/100
🚗 Travel: ${scores.travel}/100
😊 Comfort: ${scores.comfort}/100
☔ Rain risk: ${scores.rainRisk}%
${pythonExtra}

These scores summarize how suitable the current conditions are for different activities.
        `;
    }


    /* AI / PYTHON */

    if (
        /\b(ai|intelligent|analysis|recommendation|briefing|smart)\b/
            .test(text)
    ) {

        if (!currentPythonAnalysis) {

            return "🤖 Python weather analysis is not available yet. Please wait for the weather analysis to load.";
        }


        return `
🤖 WeaBuddy AI Analysis

Weather Score: ${currentPythonAnalysis.weather_score}/100

Condition:
${currentPythonAnalysis.condition}

Daily Briefing:
${currentPythonAnalysis.daily_briefing}

Travel:
${currentPythonAnalysis.travel}

Activity:
${currentPythonAnalysis.activity}
        `;
    }


    /* GENERAL WEATHER */

    if (
        /\b(weather|condition|conditions|today)\b/
            .test(text)
    ) {

        return getWeatherSummary();
    }


    /* DEFAULT */

    return `
🤔 I'm not completely sure what you mean.

I can help with:

🌡️ Temperature
☔ Rain
👕 Clothing
🏃 Outdoor activities
🏏 Sports
🧺 Picnic
🚗 Travel
🌿 AQI
💨 Wind
💧 Humidity
☁️ Clouds
👀 Visibility
🌅 Sunrise & sunset
🕐 Local time
📅 Forecast
⭐ Weather score
🤖 AI weather analysis

Try asking:

"What should I wear?"
"Will it rain?"
"Can I go cycling?"
"Is it good for a picnic?"
"What will tomorrow's weather be like?"
"Give me AI analysis"
    `;
}


/* =========================================================
   FORECAST CHAT
========================================================= */

function getForecastChatSummary() {

    if (!currentForecast?.list?.length) {

        return "The forecast isn't available right now.";
    }


    const days = {};


    currentForecast.list.forEach(
        item => {

            const date =
                new Date(
                    item.dt * 1000
                ).toLocaleDateString();


            if (!days[date]) {

                days[date] = [];
            }


            days[date].push(item);
        }
    );


    const forecastDays =
        Object.keys(days).slice(
            0,
            5
        );


    let response =
        `📅 Upcoming Forecast for ${currentCity}\n\n`;


    forecastDays.forEach(
        (date, index) => {

            const entries =
                days[date];


            const temps =
                entries.map(
                    item =>
                        item.main.temp
                );


            const min =
                Math.round(
                    Math.min(...temps)
                );


            const max =
                Math.round(
                    Math.max(...temps)
                );


            const middle =
                entries[
                    Math.floor(
                        entries.length / 2
                    )
                ];


            const rain =
                Math.round(
                    Math.max(
                        ...entries.map(
                            item =>
                                (item.pop || 0) *
                                100
                        )
                    )
                );


            response +=
                `${index === 0 ? "📍 Today" : "📅 " + date}\n` +
                `🌡️ ${min}–${max}${getTemperatureUnit()}\n` +
                `🌤️ ${capitalize(middle.weather[0].description)}\n` +
                `☔ Rain chance: ${rain}%\n\n`;
        }
    );


    return response;
}


/* =========================================================
   TOMORROW FORECAST
========================================================= */

function getTomorrowForecast() {

    if (!currentForecast?.list?.length) {

        return "Tomorrow's forecast isn't available right now.";
    }


    const tomorrow =
        new Date();


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const targetDate =
        tomorrow.toLocaleDateString();


    const groups = {};


    currentForecast.list.forEach(
        item => {

            const date =
                new Date(
                    item.dt * 1000
                ).toLocaleDateString();


            if (!groups[date]) {

                groups[date] = [];
            }


            groups[date].push(item);
        }
    );


    const dates =
        Object.keys(groups);


    const selectedDate =
        groups[targetDate]
            ? targetDate
            : dates[1] || dates[0];


    if (!selectedDate) {

        return "Tomorrow's forecast isn't available right now.";
    }


    const entries =
        groups[selectedDate];


    const temps =
        entries.map(
            item =>
                item.main.temp
        );


    const min =
        Math.round(
            Math.min(...temps)
        );


    const max =
        Math.round(
            Math.max(...temps)
        );


    const middle =
        entries[
            Math.floor(
                entries.length / 2
            )
        ];


    const rain =
        Math.round(
            Math.max(
                ...entries.map(
                    item =>
                        (item.pop || 0) *
                        100
                )
            )
        );


    return `
📅 Tomorrow's Weather — ${currentCity}

🌡️ Temperature: ${min}–${max}${getTemperatureUnit()}
🌤️ Condition: ${capitalize(middle.weather[0].description)}
☔ Rain chance: ${rain}%
💧 Humidity: ${middle.main.humidity}%

${
    rain >= 60
        ? "☔ Keep rain protection handy."
        : rain >= 30
            ? "🌦️ There may be some chance of rain."
            : "☀️ Rain does not look very likely."
}
    `;
}


/* =========================================================
   BEST FORECAST DAY
========================================================= */

function getBestForecastDay() {

    if (!currentForecast?.list?.length) {

        return "The forecast isn't available right now.";
    }


    const groups = {};


    currentForecast.list.forEach(
        item => {

            const date =
                new Date(
                    item.dt * 1000
                ).toLocaleDateString();


            if (!groups[date]) {

                groups[date] = [];
            }


            groups[date].push(item);
        }
    );


    const results =
        Object.entries(groups)
            .slice(0, 5)
            .map(
                ([date, entries]) => {

                    const temps =
                        entries.map(
                            item =>
                                item.main.temp
                        );


                    const avgTemp =
                        temps.reduce(
                            (sum, value) =>
                                sum + value,
                            0
                        ) /
                        temps.length;


                    const rain =
                        Math.max(
                            ...entries.map(
                                item =>
                                    (item.pop || 0) *
                                    100
                            )
                        );


                    let score = 100;


                    if (avgTemp < 15) {

                        score -= 20;
                    }


                    if (avgTemp > 32) {

                        score -= 20;
                    }


                    if (rain >= 60) {

                        score -= 40;

                    } else if (rain >= 30) {

                        score -= 20;
                    }


                    return {

                        date,

                        score:
                            clamp(
                                Math.round(score),
                                0,
                                100
                            )
                    };
                }
            );


    if (!results.length) {

        return "I couldn't determine the best day from the available forecast.";
    }


    results.sort(
        (a, b) =>
            b.score - a.score
    );


    const best =
        results[0];


    return `
⭐ Best Weather Day

Based on the available forecast, ${best.date} looks like the most suitable day.

Suitability score: ${best.score}/100

This is a simple recommendation based mainly on temperature and forecast rain probability.
    `;
}


/* =========================================================
   CLOTHING ADVICE
========================================================= */

function getClothingAdvice(
    temp,
    humidityValue,
    weatherId
) {

    if (
        weatherId >= 200 &&
        weatherId < 600
    ) {

        return {

            title:
                "Rain-ready clothing ☔",

            text:
                "Wear comfortable clothes that dry easily and consider carrying a light rain jacket."
        };
    }


    if (temp >= 35) {

        return {

            title:
                "Keep it light ☀️",

            text:
                "Choose lightweight, breathable clothing and avoid heavy layers."
        };
    }


    if (temp >= 28) {

        return {

            title:
                "Light & comfortable 👕",

            text:
                "Light, breathable clothing should feel comfortable in these conditions."
        };
    }


    if (temp <= 12) {

        return {

            title:
                "Layer up 🧥",

            text:
                "A warm layer or jacket will help you stay comfortable."
        };
    }


    if (temp <= 18) {

        return {

            title:
                "Bring a light layer 🧥",

            text:
                "A light jacket or sweatshirt may be useful."
        };
    }


    if (humidityValue > 75) {

        return {

            title:
                "Breathable clothes 👕",

            text:
                "Humidity is high, so lightweight and breathable clothing may feel more comfortable."
        };
    }


    return {

        title:
            "Comfortable clothes 😊",

        text:
            "The weather looks comfortable for normal everyday clothing."
    };
}


function getClothingAdviceText() {

    if (!currentWeather) {

        return "I need the current weather first.";
    }


    const weather =
        currentWeather;


    /*
       Use Python recommendation when available.
    */

    if (
        currentPythonAnalysis &&
        currentPythonAnalysis.clothing
    ) {

        return `
🤖 AI Clothing Advice

${currentPythonAnalysis.clothing}
        `;
    }


    const advice =
        getClothingAdvice(
            weather.main.temp,
            weather.main.humidity,
            weather.weather[0].id
        );


    return `
👕 ${advice.title}

${advice.text}
    `;
}


/* =========================================================
   CHAT MESSAGE UI
========================================================= */

function addUserMessage(message) {

    if (!chatWindow) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "chat-message message user-message";


    div.innerHTML = `
        <div class="message-content">
            <p>
                ${escapeHTML(message)}
            </p>
        </div>
    `;


    chatWindow.appendChild(
        div
    );


    scrollChatToBottom();
}


function addBotMessage(message) {

    if (!chatWindow) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "chat-message message bot-message";


    div.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-cloud-sun"></i>
        </div>

        <div class="message-content">

            <span class="message-name">
                WEABUDDY AI
            </span>

            <p>
                ${escapeHTML(message)
                    .replace(
                        /\n/g,
                        "<br>"
                    )}
            </p>

        </div>
    `;


    chatWindow.appendChild(
        div
    );


    scrollChatToBottom();
}


function clearChatMessages() {

    if (!chatWindow) return;


    chatWindow.innerHTML =
        "";


    refreshBotGreeting();
}


function refreshBotGreeting() {

    if (!chatWindow) return;


    if (
        chatWindow.children.length > 0
    ) {

        return;
    }


    const greeting =
        currentCity

            ? `Hi! 👋 I'm WeaBuddy AI. The weather in ${currentCity} is ready to explore. 🌤️ Ask me about temperature, clothing, rain, travel, sports, AQI, or the forecast.`

            : "Hi! 👋 I'm WeaBuddy AI. Ask me anything about the weather.";


    addBotMessage(
        greeting
    );
}


function scrollChatToBottom() {

    if (!chatWindow) return;


    chatWindow.scrollTop =
        chatWindow.scrollHeight;
}


/* =========================================================
   UI HELPERS
========================================================= */

function setText(
    element,
    value
) {

    if (!element) return;


    element.textContent =
        value ?? "";
}


function setRecommendation(
    element,
    value
) {

    if (!element) return;


    element.textContent =
        value ?? "";
}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );
}


function capitalize(text) {

    if (!text) return "";


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   API VALIDATION
========================================================= */

function isAPIReady() {

    return (
        typeof API_KEY === "string" &&
        API_KEY.trim().length > 10 &&
        API_KEY !==
            "YOUR_OPENWEATHER_API_KEY" &&
        API_KEY !==
            "PASTE_YOUR_NEW_OPENWEATHER_API_KEY_HERE"
    );
}


async function handleAPIError(
    status
) {

    if (status === 401) {

        throw new Error(
            "OpenWeather API key is invalid or not activated yet."
        );
    }


    if (status === 404) {

        throw new Error(
            "City not found. Please check the city name."
        );
    }


    if (status === 429) {

        throw new Error(
            "Too many API requests. Please try again later."
        );
    }


    if (status >= 500) {

        throw new Error(
            "OpenWeather is temporarily unavailable."
        );
    }


    throw new Error(
        `Weather request failed (${status}).`
    );
}


/* =========================================================
   LOADING & ERROR UI
========================================================= */

function showLoading() {

    if (!loadingOverlay) return;


    loadingOverlay.classList.add(
        "active"
    );
}


function hideLoading() {

    if (!loadingOverlay) return;


    loadingOverlay.classList.remove(
        "active"
    );
}


function showError(message) {

    if (errorText) {

        errorText.textContent =
            message;
    }


    if (errorMessage) {

        errorMessage.classList.add(
            "active"
        );
    }


    console.error(
        "WeaBuddy:",
        message
    );
}


function hideError() {

    if (!errorMessage) return;


    errorMessage.classList.remove(
        "active"
    );
}


/* =========================================================
   DEBOUNCE
========================================================= */

function debounce(
    functionToCall,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () =>
                    functionToCall(
                        ...args
                    ),
                delay
            );
    };
}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   SAVE LAST CITY
========================================================= */

function saveLastCity(city) {

    if (!city) return;


    localStorage.setItem(
        "weabuddyLastCity",
        city
    );
}


/* =========================================================
   END OF SCRIPT
========================================================= */