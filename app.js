// Function to get weather data based on city name input
async function getWeather() {
    const apiKey = 'd4fd08984d351d9191d7b30df5e82861'; // Your API key for the OpenWeatherMap API
    const city = document.getElementById('city').value; // Get the city name from the input field
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${apiKey}&units=metric`; // Construct the API URL with the city and API key

    document.getElementById('loading').style.display = 'block'; // Show a loading indicator while fetching data

    try {
        const response = await fetch(url); // Fetch the weather data from the API
        if (!response.ok) {
            throw new Error('City not found'); // Throw an error if the response is not OK
        }
        const data = await response.json(); // Parse the response data as JSON
        displayWeather(data); // Call the function to display the weather data
    } catch (error) {
        document.getElementById('weatherInfo').innerHTML = `<p class="error">${error.message}</p>`; // Display an error message if the fetch fails
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide the loading indicator after the data is fetched or an error occurs
    }
}

// Function to get weather data based on geographical coordinates
async function getWeatherByLocation(lat, lon) {
    const apiKey = 'd4fd08984d351d9191d7b30df5e82861'; // Your API key for the OpenWeatherMap API
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${apiKey}&units=metric`; // Construct the API URL with the latitude, longitude, and API key

    document.getElementById('loading').style.display = 'block'; // Show a loading indicator while fetching data

    try {
        const response = await fetch(url); // Fetch the weather data from the API
        if (!response.ok) {
            throw new Error('Location not found'); // Throw an error if the response is not OK
        }
        const data = await response.json(); // Parse the response data as JSON
        displayWeather(data); // Call the function to display the weather data
    } catch (error) {
        document.getElementById('weatherInfo').innerHTML = `<p class="error">${error.message}</p>`; // Display an error message if the fetch fails
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide the loading indicator after the data is fetched or an error occurs
    }
}

// Function to get the current location's weather data using the browser's geolocation
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords; // Get the current position's latitude and longitude
            getWeatherByLocation(latitude, longitude); // Fetch the weather data using the current location's coordinates
        }, error => {
            document.getElementById('weatherInfo').innerHTML = `<p class="error">Geolocation error: ${error.message}</p>`; // Display an error message if the geolocation fails
        });
    } else {
        document.getElementById('weatherInfo').innerHTML = `<p class="error">Geolocation is not supported by this browser.</p>`; // Display an error message if geolocation is not supported
    }
}

// Function to display the weather data in the UI
function displayWeather(data) {
    if (data.cod === '200') { // Check if the API response code is 200 (OK)
        // Convert temperatures from Celsius to Fahrenheit
        const temps = data.list.slice(0, 5).map(item => (item.main.temp * 9/5) + 32);
        const labels = data.list.slice(0, 5).map(item => new Date(item.dt * 1000).toLocaleDateString()); // Get the dates for the forecast

        // Construct the HTML to display the weather information
        const weatherInfo = `
            <h2>${data.city.name}, ${data.city.country}</h2>
            <p><i class="fas fa-${getWeatherIcon(data.list[0].weather[0].icon)} weather-icon"></i> Temperature: ${(data.list[0].main.temp * 9/5 + 32).toFixed(2)}°F</p>
            <p>Weather: ${data.list[0].weather[0].description}</p>
            <p>Humidity: ${data.list[0].main.humidity}%</p>
            <p>Wind Speed: ${data.list[0].wind.speed} m/s</p>
            <p>UV Index: ${data.list[0].uv_index || 'N/A'}</p>
            <p>Sunrise: ${new Date(data.city.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(data.city.sunset * 1000).toLocaleTimeString()}</p>
            <h3>5-Day Forecast</h3>
            <div class="forecast">${data.list.slice(0, 5).map((item, index) => `
                <div class="forecast-item">
                    <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
                    <p>${new Date(item.dt * 1000).toLocaleTimeString()}</p>
                    <p><i class="fas fa-${getWeatherIcon(item.weather[0].icon)} weather-icon"></i></p>
                    <p>${(item.main.temp * 9/5 + 32).toFixed(2)}°F</p>
                </div>
            `).join('')}</div>
            <canvas id="weatherChart"></canvas>
        `;

        document.getElementById('weatherInfo').innerHTML = weatherInfo; // Insert the weather information into the DOM

        const ctx = document.getElementById('weatherChart').getContext('2d'); // Get the canvas context for the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Set the labels for the x-axis
                datasets: [{
                    label: 'Temperature (°F)', // Set the label for the dataset
                    data: temps, // Set the data for the dataset
                    borderColor: 'rgba(75, 192, 192, 1)', // Set the border color for the line
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Set the background color for the line
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Ensure the y-axis starts at zero
                    }
                }
            }
        });
    } else {
        document.getElementById('weatherInfo').innerHTML = `<p class="error">${data.message}</p>`; // Display an error message if the API response is not OK
    }
}

// Function to get the appropriate weather icon based on the icon code from the API
function getWeatherIcon(iconCode) {
    switch (iconCode) {
        case '01d': return 'sun'; // Clear sky (day)
        case '01n': return 'moon'; // Clear sky (night)
        case '02d':
        case '02n': return 'cloud-sun'; // Few clouds
        case '03d':
        case '03n': return 'cloud'; // Scattered clouds
        case '04d':
        case '04n': return 'cloud-meatball'; // Broken clouds
        case '09d':
        case '09n': return 'cloud-showers-heavy'; // Shower rain
        case '10d':
        case '10n': return 'cloud-rain'; // Rain
        case '11d':
        case '11n': return 'bolt'; // Thunderstorm
        case '13d':
        case '13n': return 'snowflake'; // Snow
        case '50d':
        case '50n': return 'smog'; // Mist
        default: return 'question'; // Default icon for unknown conditions
    }
}
