const appState = {
    sensors: {
        temperature: 22,
        humidity: 45,
        airQuality: 60,
        energy: 350
    }
};

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

function addLog(message) {
    const listItem = document.createElement("li");
    const time = new Date().toLocaleTimeString();

    listItem.textContent = `[${time}] ${message}`;
    eventLog.prepend(listItem);
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

temperatureSlider.addEventListener("input", updateSensorValues);
humiditySlider.addEventListener("input", updateSensorValues);
airQualitySlider.addEventListener("input", updateSensorValues);
energySlider.addEventListener("input", updateSensorValues);

runAutomationBtn.addEventListener("click", runSmartHomeAutomation);

updateSensorValues();
addLog("Smart Home Monitoring System started.");
