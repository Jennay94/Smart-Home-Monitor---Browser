const appState = {
    user: localStorage.getItem("smartHomeLoggedInUser") || null,
    sensors: {
        temperature: 22,
        humidity: 45,
        airQuality: 60,
        energy: 350
    }
};

const validUser = {
    username: "admin",
    password: "smart123"
};

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const loggedInUserText = document.getElementById("loggedInUserText");

const temperatureSlider = document.getElementById("temperatureSlider");
const humiditySlider = document.getElementById("humiditySlider");
const airQualitySlider = document.getElementById("airQualitySlider");
const energySlider = document.getElementById("energySlider");

const temperatureValue = document.getElementById("temperatureValue");
const humidityValue = document.getElementById("humidityValue");
const airQualityValue = document.getElementById("airQualityValue");
const energyValue = document.getElementById("energyValue");

const heatingStatus = document.getElementById("heatingStatus");
const coolingStatus = document.getElementById("coolingStatus");
const airPurifierStatus = document.getElementById("airPurifierStatus");
const energyAlertStatus = document.getElementById("energyAlertStatus");

const loadSensorDataBtn = document.getElementById("loadSensorDataBtn");
const runAutomationBtn = document.getElementById("runAutomationBtn");
const eventLog = document.getElementById("eventLog");

const cityInput = document.getElementById("cityInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherResult = document.getElementById("weatherResult");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const mainHeader = document.querySelector(".site-header");
const elements = { themeToggle, menuToggle, navLinks };

function addLog(message) {
    const listItem = document.createElement("li");
    const time = new Date().toLocaleTimeString();

    listItem.textContent = `[${time}] ${message}`;
    eventLog.prepend(listItem);
}

function updateAuthView() {
    if (appState.user) {
        loginSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        loggedInUserText.textContent = appState.user;
    } else {
        loginSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");
        loggedInUserText.textContent = "";
    }
}

function loginUser() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "" || password === "") {
        loginMessage.textContent = "Please enter both username and password.";
        loginMessage.style.color = "red";
        return;
    }

    if (username === validUser.username && password === validUser.password) {
        appState.user = username;
        localStorage.setItem("smartHomeLoggedInUser", username);

        usernameInput.value = "";
        passwordInput.value = "";
        loginMessage.textContent = "";

        updateAuthView();
        addLog(`${username} logged in successfully.`);
    } else {
        loginMessage.textContent = "Invalid username or password.";
        loginMessage.style.color = "red";
    }
}

function logoutUser() {
    addLog(`${appState.user} logged out.`);

    appState.user = null;
    localStorage.removeItem("smartHomeLoggedInUser");

    updateAuthView();
}

function updateSensorValues() {
    appState.sensors.temperature = Number(temperatureSlider.value);
    appState.sensors.humidity = Number(humiditySlider.value);
    appState.sensors.airQuality = Number(airQualitySlider.value);
    appState.sensors.energy = Number(energySlider.value);

    temperatureValue.textContent = appState.sensors.temperature;
    humidityValue.textContent = appState.sensors.humidity;
    airQualityValue.textContent = appState.sensors.airQuality;
    energyValue.textContent = appState.sensors.energy;
}

async function loadSensorDataFromApi() {
    try {
        const response = await fetch("sensor-data.json");

        if (!response.ok) {
            throw new Error("Could not load sensor data.");
        }

        const data = await response.json();

        appState.sensors.temperature = Number(data.indoorTemperature);
        appState.sensors.humidity = Number(data.humidity);
        appState.sensors.airQuality = Number(data.airQuality);
        appState.sensors.energy = Number(data.energy);

        temperatureSlider.value = appState.sensors.temperature;
        humiditySlider.value = appState.sensors.humidity;
        airQualitySlider.value = appState.sensors.airQuality;
        energySlider.value = appState.sensors.energy;

        updateSensorValues();

        addLog("Sensor data loaded from mock sensor API.");
    } catch (error) {
        addLog("Failed to load sensor data from API.");
    }
}

function setStatus(element, text, className) {
    element.textContent = text;
    element.className = `status ${className}`;
}

function runSmartHomeAutomation() {
    updateSensorValues();

    const temperature = appState.sensors.temperature;
    const airQuality = appState.sensors.airQuality;
    const energy = appState.sensors.energy;

    if (temperature < 19) {
        setStatus(heatingStatus, "ON", "on");
        setStatus(coolingStatus, "OFF", "off");
        addLog("Heating turned on because indoor temperature is low.");
    } else if (temperature > 27) {
        setStatus(heatingStatus, "OFF", "off");
        setStatus(coolingStatus, "ON", "on");
        addLog("Cooling turned on because indoor temperature is high.");
    } else {
        setStatus(heatingStatus, "OFF", "off");
        setStatus(coolingStatus, "OFF", "off");
        addLog("Temperature is comfortable. Heating and cooling are off.");
    }

    if (airQuality < 50) {
        setStatus(airPurifierStatus, "ON", "on");
        addLog("Air purifier turned on because air quality is low.");
    } else {
        setStatus(airPurifierStatus, "OFF", "off");
        addLog("Air quality is acceptable. Air purifier is off.");
    }

    if (energy > 1200) {
        setStatus(energyAlertStatus, "HIGH", "warning");
        addLog("Energy usage is high. Energy alert is active.");
    } else {
        setStatus(energyAlertStatus, "NORMAL", "on");
        addLog("Energy usage is normal.");
    }
}

async function getCoordinates(city) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

    const response = await fetch(geocodingUrl);

    if (!response.ok) {
        throw new Error("Could not load city data.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found.");
    }

    return {
        name: data.results[0].name,
        country: data.results[0].country,
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude
    };
}

async function getWeather() {
    const city = cityInput.value.trim();

    if (city.length === 0) {
        weatherResult.innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    weatherResult.innerHTML = "<p>Loading weather data...</p>";

    try {
        const location = await getCoordinates(city);

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

        const response = await fetch(weatherUrl);

        if (!response.ok) {
            throw new Error("Weather request failed.");
        }

        const data = await response.json();

        weatherResult.innerHTML = `
            <h3>${location.name}, ${location.country}</h3>
            <p>Temperature: <strong>${data.current.temperature_2m} °C</strong></p>
            <p>Humidity: <strong>${data.current.relative_humidity_2m} %</strong></p>
            <p>Wind speed: <strong>${data.current.wind_speed_10m} km/h</strong></p>
        `;

        addLog(`Weather data loaded for ${location.name}.`);
    } catch (error) {
        weatherResult.innerHTML = `<p>${error.message}</p>`;
        addLog("Weather API request failed.");
    }
}

function addChatMessage(sender, message, type) {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${type}-message`;

    messageElement.innerHTML = `
        <strong>${sender}:</strong>
        <p>${message}</p>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getSensorContext() {
    return {
        temperature: appState.sensors.temperature,
        humidity: appState.sensors.humidity,
        airQuality: appState.sensors.airQuality,
        energy: appState.sensors.energy,
        heatingStatus: heatingStatus.textContent,
        coolingStatus: coolingStatus.textContent,
        airPurifierStatus: airPurifierStatus.textContent,
        energyAlertStatus: energyAlertStatus.textContent
    };
}

async function sendChatMessage() {
    const userMessage = chatInput.value.trim();

    if (userMessage === "") {
        return;
    }

    addChatMessage("You", userMessage, "user");
    chatInput.value = "";

    addChatMessage("Assistant", "Thinking...", "bot");

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
                sensorContext: getSensorContext()
            })
        });

        const data = await response.json();

        const botMessages = document.querySelectorAll(".bot-message");
        const lastBotMessage = botMessages[botMessages.length - 1];

        if (!response.ok) {
            lastBotMessage.innerHTML = `
                <strong>Assistant:</strong>
                <p>Sorry, the AI request failed.</p>
            `;
            addLog("AI chat request failed.");
            return;
        }

        lastBotMessage.innerHTML = `
            <strong>Assistant:</strong>
            <p>${data.reply}</p>
        `;

        addLog("AI chat response received.");
    } catch (error) {
        const botMessages = document.querySelectorAll(".bot-message");
        const lastBotMessage = botMessages[botMessages.length - 1];

        lastBotMessage.innerHTML = `
            <strong>Assistant:</strong>
            <p>Could not connect to the AI server.</p>
        `;

        addLog("AI chat server connection failed.");
    }
}

function setupTheme() {
  const storedTheme = localStorage.getItem("smart-home-theme");

  if (storedTheme === "dark") {
    document.body.classList.add("dark");
  }

  elements.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("smart-home-theme", theme);
  });
}


function setupNavigation() {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

function init() {
    setupTheme();
    setupNavigation();

    loginBtn.addEventListener("click", loginUser);
    logoutBtn.addEventListener("click", logoutUser);

    passwordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            loginUser();
        }
    });

    temperatureSlider.addEventListener("input", updateSensorValues);
    humiditySlider.addEventListener("input", updateSensorValues);
    airQualitySlider.addEventListener("input", updateSensorValues);
    energySlider.addEventListener("input", updateSensorValues);

    loadSensorDataBtn.addEventListener("click", loadSensorDataFromApi);
    runAutomationBtn.addEventListener("click", runSmartHomeAutomation);

    weatherBtn.addEventListener("click", getWeather);

    sendChatBtn.addEventListener("click", sendChatMessage);

    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendChatMessage();
        }
    });

    updateAuthView();
    updateSensorValues();

    if (appState.user) {
        addLog("Smart Home Monitoring System started.");
    }
}

init();