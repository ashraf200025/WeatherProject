const rapidApiKey = "0e9311c3ccmsh5ed3dab45d4b48dp162e88jsn14b5d084487d";
const meteostatHost = "meteostat.p.rapidapi.com";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

async function getCoordinates(city) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
    const data = await response.json();
    if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name.split(',')[0] };
    }
    throw new Error("City not found");
}

async function getWeather(lat, lon, cityName) {
    // Show loading state immediately for speed perception
    document.getElementById("cityName").innerText = "Loading...";
    
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4); 
    const endDate = nextWeek.toISOString().split('T')[0];

    const url = `https://${meteostatHost}/point/daily?lat=${lat}&lon=${lon}&start=${today}&end=${endDate}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-rapidapi-key': rapidApiKey, 'x-rapidapi-host': meteostatHost }
        });
        const result = await response.json();

        // Update main weather
        document.getElementById("cityName").innerText = cityName;
        document.getElementById("temp").innerText = Math.round(result.data[0].tavg) + "°C";
        document.getElementById("desc").innerText = "Cloudy Skies";

        // Update Forecast
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = ""; 

        result.data.slice(1, 5).forEach(day => {
            const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            forecastDiv.innerHTML += `
                <div class="forecast-item">
                    <div>${date}</div>
                    <div style="font-weight:bold">${Math.round(day.tavg)}°C</div>
                </div>
            `;
        });
    } catch (error) {
        alert("API Busy. Try again in a moment.");
        document.getElementById("cityName").innerText = "Error";
    }
}

searchBtn.addEventListener("click", async () => {
    if (cityInput.value) {
        try {
            const coords = await getCoordinates(cityInput.value);
            getWeather(coords.lat, coords.lon, coords.name);
        } catch (e) {
            alert("City not found!");
        }
    }
});