const deviceForm = document.getElementById("deviceForm");
const deviceList = document.getElementById("deviceList");
const themeToggle = document.getElementById("themeToggle");

const editIndexInput = document.getElementById("editIndex");
const deviceNameInput = document.getElementById("deviceName");
const deviceTypeInput = document.getElementById("deviceType");
const thingSpeakFieldInput = document.getElementById("thingSpeakField");
const deviceLocationInput = document.getElementById("deviceLocation");
const saveDeviceBtn = document.getElementById("saveDeviceBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let devices = JSON.parse(localStorage.getItem("smartHomeDevices")) || [];

function saveDevices() {
  localStorage.setItem("smartHomeDevices", JSON.stringify(devices));
}

function formatDate(dateString) {
  if (!dateString) {
    return "Not available";
  }

  return new Date(dateString).toLocaleString();
}

function renderDevices() {
  deviceList.innerHTML = "";

  if (devices.length === 0) {
    deviceList.innerHTML = "<p>No devices added yet.</p>";
    return;
  }

  devices.forEach((device, index) => {
    const item = document.createElement("div");
    item.className = "saved-device device-list-item";

    item.innerHTML = `
      <div>
        <h4>${device.name}</h4>
        <p><strong>Type:</strong> ${device.type}</p>
        <p><strong>ThingSpeak field:</strong> ${device.field || "Not assigned"}</p>
        <p><strong>Location:</strong> ${device.location || "Not specified"}</p>
        <p><strong>Status:</strong> ${device.status || "Active"}</p>
        <p><strong>Created:</strong> ${formatDate(device.createdAt)}</p>
      </div>

      <div class="device-actions">
        <button class="button secondary" type="button" onclick="editDevice(${index})">
          Edit
        </button>
        <button class="button danger-small" type="button" onclick="deleteDevice(${index})">
          Delete
        </button>
      </div>
    `;

    deviceList.appendChild(item);
  });
}

function resetForm() {
  deviceForm.reset();
  editIndexInput.value = "";
  saveDeviceBtn.textContent = "Save device";
}

function editDevice(index) {
  const device = devices[index];

  editIndexInput.value = index;
  deviceNameInput.value = device.name;
  deviceTypeInput.value = device.type;
  thingSpeakFieldInput.value = device.field || "";
  deviceLocationInput.value = device.location || "";

  saveDeviceBtn.textContent = "Update device";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteDevice(index) {
  const confirmDelete = confirm("Are you sure you want to delete this device?");

  if (!confirmDelete) {
    return;
  }

  devices.splice(index, 1);
  saveDevices();
  renderDevices();
  resetForm();
}

deviceForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const editIndex = editIndexInput.value;

  const name = deviceNameInput.value.trim();
  const type = deviceTypeInput.value;
  const field = thingSpeakFieldInput.value.trim();
  const location = deviceLocationInput.value.trim();

  if (name === "" || type === "") {
    alert("Please enter a device name and select a device type.");
    return;
  }

  const deviceData = {
    name,
    type,
    field,
    thingSpeakField: field,
    location,
    status: "Active",
    createdAt: editIndex === "" ? new Date().toISOString() : devices[editIndex].createdAt,
    updatedAt: new Date().toISOString()
  };

  if (editIndex === "") {
    devices.push(deviceData);
  } else {
    devices[editIndex] = deviceData;
  }

  saveDevices();
  renderDevices();
  resetForm();
});

cancelEditBtn.addEventListener("click", resetForm);

function setupTheme() {
  const storedTheme = localStorage.getItem("smart-home-theme");

  if (storedTheme === "dark") {
    document.body.classList.add("dark");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("smart-home-theme", theme);
  });
}

setupTheme();
renderDevices();