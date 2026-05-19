const appState = {
    verificationCode: null,
    currentUser: localStorage.getItem("smartHomeUser") || null,
    sensors: {
        temperature: 22,
        humidity: 45,
        airQuality: 60,
        energy: 350
    }
};

const emailInput = document.getElementById("emailInput");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const codeArea = document.getElementById("codeArea");
const generatedCodeText = document.getElementById("generatedCodeText");
const codeInput = document.getElementById("codeInput");
const verifyCodeBtn = document.getElementById("verifyCodeBtn");
const loginMessage = document.getElementById("loginMessage");
const loggedOutView = document.getElementById("loggedOutView");
const loggedInView = document.getElementById("loggedInView");
const userEmailText = document.getElementById("userEmailText");
const logoutBtn = document.getElementById("logoutBtn");

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

const runAutomationBtn = document.getElementById("runAutomationBtn");
const eventLog = document.getElementById("eventLog");

const cityInput = document.getElementById("cityInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherResult = document.getElementById("weatherResult");

const themeToggle = document.getElementById("themeToggle");

function addLog(message) {
    const listItem = document.createElement("li");
    const time = new Date().toLocaleTimeString();

    listItem.textContent = `[${time}] ${message}`;
    eventLog.prepend(listItem);
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
    return email.includes("@") && email.includes(".");
}

function updateLoginView() {
    if (appState.currentUser) {
        loggedOutView.classList.add("hidden");
        loggedInView.classList.remove("hidden");
        userEmailText.textContent = appState.currentUser;
    } else {
        loggedOutView.classList.remove("hidden");
        loggedInView.classList.add("hidden");
        userEmailText.textContent = "";
    }
}

sendCodeBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
        loginMessage.textContent = "Please enter a valid email address.";
        loginMessage.style.color = "red";
        return;
    }

    appState.verificationCode = generateVerificationCode();
    generatedCodeText.textContent = appState.verificationCode;
    codeArea.classList.remove("hidden");

    loginMessage.textContent = "Verification code generated successfully.";
    loginMessage.style.color = "green";

    addLog(`Verification code generated for ${email}.`);
});

verifyCodeBtn.addEventListener("click", () => {
    const enteredCode = codeInput.value.trim();
    const email = emailInput.value.trim();

    if (enteredCode === appState.verificationCode) {
        appState.currentUser = email;
        localStorage.setItem("smartHomeUser", email);

        loginMessage.textContent = "";
        codeInput.value = "";
        emailInput.value = "";
        codeArea.classList.add("hidden");

        updateLoginView();
        addLog(`${email} logged in successfully.`);
    } else {
        loginMessage.textContent = "Invalid verification code.";
        loginMessage.style.color = "red";
    }
});

logoutBtn.addEventListener("click", () => {
    addLog(`${appState.currentUser} logged out.`);

    appState.currentUser = null;
    appState.verificationCode = null;
    localStorage.removeItem("smartHomeUser");

    updateLoginView();
});

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

function setStatus(element, text, className) {
    element.textContent = text;
    element.className = `status ${className}`;
}

function runSmartHomeAutomation() {
    updateSensorValues();

    const { temperature, airQuality, energy } = appState.sensors;

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

temperatureSlider.addEventListener("input", updateSensorValues);
humiditySlider.addEventListener("input", updateSensorValues);
airQualitySlider.addEventListener("input", updateSensorValues);
energySlider.addEventListener("input", updateSensorValues);

runAutomationBtn.addEventListener("click", runSmartHomeAutomation);

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

weatherBtn.addEventListener("click", getWeather);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("smartHomeTheme", isDark ? "dark" : "light");

    addLog("Theme changed.");
});

function loadSavedTheme() {
    const savedTheme = localStorage.getItem("smartHomeTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
}

loadSavedTheme();
updateSensorValues();
updateLoginView();
addLog("Smart Home Monitoring System started.");