const appState = {
    user: localStorage.getItem("smartHomeLoggedInUser") || null,
    devices: JSON.parse(localStorage.getItem("smartHomeDevices")) || [
        { name: "Living Room Light", type: "Light" }
    ],
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

/* ===== Login elements ===== */

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const loggedInUserText = document.getElementById("loggedInUserText");

/* ===== Navbar elements ===== */

const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const elements = {
    themeToggle,
    menuToggle,
    navLinks
};

/* ===== Sensor elements ===== */

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

/* ===== Weather elements ===== */

const cityInput = document.getElementById("cityInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherResult = document.getElementById("weatherResult");

/* ===== Chat elements ===== */

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

/* ===== Device form/list elements ===== */

const addDeviceForm = document.getElementById("addDeviceForm");
const deviceNameInput = document.getElementById("deviceNameInput");
const deviceTypeInput = document.getElementById("deviceTypeInput");
const deviceList = document.getElementById("deviceList");

/* ===== General log ===== */

function addLog(message) {
    if (!eventLog) {
        return;
    }

    const listItem = document.createElement("li");
    const time = new Date().toLocaleTimeString();

    listItem.textContent = `[${time}] ${message}`;
    eventLog.prepend(listItem);
}

/* ===== Authentication ===== */

function updateAuthView() {
    if (!loginSection || !dashboardSection) {
        return;
    }

    if (appState.user) {
        loginSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");

        if (loggedInUserText) {
            loggedInUserText.textContent = appState.user;
        }

        loadLatestThingSpeakHeroData();
    } else {
        loginSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");

        if (loggedInUserText) {
            loggedInUserText.textContent = "";
        }

        showLockedThingSpeakHeroData();
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

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

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

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ===== Sensor dashboard ===== */

function updateSensorValues() {
    if (
        !temperatureSlider ||
        !humiditySlider ||
        !airQualitySlider ||
        !energySlider ||
        !temperatureValue ||
        !humidityValue ||
        !airQualityValue ||
        !energyValue
    ) {
        return;
    }

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

        if (temperatureSlider) {
            temperatureSlider.value = appState.sensors.temperature;
        }

        if (humiditySlider) {
            humiditySlider.value = appState.sensors.humidity;
        }

        if (airQualitySlider) {
            airQualitySlider.value = appState.sensors.airQuality;
        }

        if (energySlider) {
            energySlider.value = appState.sensors.energy;
        }

        updateSensorValues();

        addLog("Sensor data loaded from mock sensor API.");
    } catch (error) {
        addLog("Failed to load sensor data from API.");
    }
}

/* ===== ThingSpeak latest data ===== */

function showLockedThingSpeakHeroData() {
    const systemStatus = document.getElementById("systemStatus");
    const heroTemperature = document.getElementById("heroTemperature");
    const heroHumidity = document.getElementById("heroHumidity");
    const heroAirPressure = document.getElementById("heroAirPressure");
    const heroFanStatus = document.getElementById("heroFanStatus");
    const heroLight = document.getElementById("heroLight");

    if (systemStatus) {
        systemStatus.textContent = "Nice try. The smart home secrets are hiding behind the login door.";
    }

    if (heroTemperature) {
        heroTemperature.textContent = "Locked";
    }

    if (heroHumidity) {
        heroHumidity.textContent = "Locked";
    }

    if (heroAirPressure) {
        heroAirPressure.textContent = "Locked";
    }

    if (heroFanStatus) {
        heroFanStatus.textContent = "Locked";
    }

    if (heroLight) {
        heroLight.textContent = "Locked";
    }
}

async function loadLatestThingSpeakHeroData() {
    if (!appState.user) {
        showLockedThingSpeakHeroData();
        return;
    }

    const url = "https://api.thingspeak.com/channels/3156213/feeds/last.json";

    const systemStatus = document.getElementById("systemStatus");
    const heroTemperature = document.getElementById("heroTemperature");
    const heroHumidity = document.getElementById("heroHumidity");
    const heroAirPressure = document.getElementById("heroAirPressure");
    const heroFanStatus = document.getElementById("heroFanStatus");
    const heroLight = document.getElementById("heroLight");

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not load ThingSpeak data.");
        }

        const data = await response.json();

        const temperature = Number(data.field1);
        const humidity = Number(data.field2);
        const airPressure = Number(data.field6);
        const fan = Number(data.field5);
        const light = Number(data.field7);

        if (heroTemperature) {
            heroTemperature.textContent = Number.isFinite(temperature)
                ? `${temperature.toFixed(1)} °C`
                : "-- °C";
        }

        if (heroHumidity) {
            heroHumidity.textContent = Number.isFinite(humidity)
                ? `${humidity.toFixed(0)} %`
                : "-- %";
        }

        if (heroAirPressure) {
            heroAirPressure.textContent = Number.isFinite(airPressure)
                ? `${airPressure.toFixed(1)} hPa`
                : "--";
        }

        if (heroFanStatus) {
            heroFanStatus.textContent = fan === 1 ? "ON" : "OFF";
        }

        if (heroLight) {
            heroLight.textContent = Number.isFinite(light)
                ? `${light.toFixed(0)} lux`
                : "--";
        }

        if (systemStatus) {
            const entryDate = new Date(data.created_at).toLocaleString();
            systemStatus.textContent = `Last sensor update: ${entryDate}`;
        }

        addLog("Latest ThingSpeak sensor data loaded.");
    } catch (error) {
        if (systemStatus) {
            systemStatus.textContent = "ThingSpeak data could not be loaded.";
        }

        addLog("Failed to load latest ThingSpeak sensor data.");
    }
}

/* ===== Automation ===== */

function setStatus(element, text, className) {
    if (!element) {
        return;
    }

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

/* ===== Weather API ===== */

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

/* ===== AI Chat ===== */

function addChatMessage(sender, message, type) {
    if (!chatMessages) {
        return;
    }

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
        heatingStatus: heatingStatus ? heatingStatus.textContent : "OFF",
        coolingStatus: coolingStatus ? coolingStatus.textContent : "OFF",
        airPurifierStatus: airPurifierStatus ? airPurifierStatus.textContent : "OFF",
        energyAlertStatus: energyAlertStatus ? energyAlertStatus.textContent : "NORMAL"
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

        if (lastBotMessage) {
            lastBotMessage.innerHTML = `
                <strong>Assistant:</strong>
                <p>Could not connect to the AI server.</p>
            `;
        }

        addLog("AI chat server connection failed.");
    }
}

/* ===== Devices ===== */

function renderDeviceList() {
    if (!deviceList) {
        return;
    }

    deviceList.innerHTML = "";

    if (appState.devices.length === 0) {
        deviceList.innerHTML = "<li>No devices added yet.</li>";
        return;
    }

    appState.devices.forEach((device) => {
        const item = document.createElement("li");
        item.className = "device-list-item";

        item.innerHTML = `
            <div>
                <strong>${device.name}</strong>
                <span>${device.type}</span>
            </div>
            <span>Active</span>
        `;

        deviceList.appendChild(item);
    });
}

function addDevice(event) {
    event.preventDefault();

    const name = deviceNameInput.value.trim();
    const type = deviceTypeInput.value;

    if (name === "") {
        addLog("Device name is required.");
        return;
    }

    appState.devices.push({
        name,
        type
    });

    localStorage.setItem("smartHomeDevices", JSON.stringify(appState.devices));

    deviceNameInput.value = "";
    deviceTypeInput.value = "Light";

    renderDeviceList();
    addLog(`New device added: ${name}.`);
}

/* ===== Theme / Navigation ===== */

function setupTheme() {
    const storedTheme = localStorage.getItem("smart-home-theme");

    if (storedTheme === "dark") {
        document.body.classList.add("dark");
    }

    if (!elements.themeToggle) {
        return;
    }

    elements.themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const theme = document.body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("smart-home-theme", theme);
    });
}

function setupNavigation() {
    if (!menuToggle || !navLinks) {
        return;
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    const navItems = navLinks.querySelectorAll("a");

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* ===== Init ===== */

function init() {
    setupTheme();
    setupNavigation();

    if (loginBtn) {
        loginBtn.addEventListener("click", loginUser);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }

    if (passwordInput) {
        passwordInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                loginUser();
            }
        });
    }

    if (temperatureSlider) {
        temperatureSlider.addEventListener("input", updateSensorValues);
    }

    if (humiditySlider) {
        humiditySlider.addEventListener("input", updateSensorValues);
    }

    if (airQualitySlider) {
        airQualitySlider.addEventListener("input", updateSensorValues);
    }

    if (energySlider) {
        energySlider.addEventListener("input", updateSensorValues);
    }

    if (loadSensorDataBtn) {
        loadSensorDataBtn.addEventListener("click", loadSensorDataFromApi);
    }

    if (runAutomationBtn) {
        runAutomationBtn.addEventListener("click", runSmartHomeAutomation);
    }

    if (weatherBtn) {
        weatherBtn.addEventListener("click", getWeather);
    }

    if (sendChatBtn) {
        sendChatBtn.addEventListener("click", sendChatMessage);
    }

    if (chatInput) {
        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                sendChatMessage();
            }
        });
    }

    if (addDeviceForm) {
        addDeviceForm.addEventListener("submit", addDevice);
    }

    updateAuthView();
    updateSensorValues();
    renderDeviceList();

    if (appState.user) {
        addLog("Smart Home Monitoring System started.");
    }
}

init();