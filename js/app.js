const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
}

const appState = {
  userId: tg?.initDataUnsafe?.user?.id || 12345,
  level: "B2",
  temperature: 7,
};

function hidePreloader() {
  document.getElementById("preloader").classList.remove("preloader_show");
}

let toastTimer = null;
function showToast(message = "Saved Successfully ✅") {
  const toast = document.getElementById("toast-notification");
  toast.innerText = message;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toast.classList.remove("show");
    // Browser hack
    void toast.offsetWidth;
  }

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toastTimer = null;
  }, 2500);
}

/*  ================================
  API SETTINGS
 ==================================== */

const API_BASE_URL = "https://3nz24zdv-8000.euw.devtunnels.ms";

async function loadSettings() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/settings/${appState.userId}`,
      {
        headers: {
          "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
        },
      },
    );
    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    appState.level = data.level;
    appState.temperature = data.temperature_frontend;
    console.log(
      `id: ${data.user_id}, level: ${data.level}, temp: ${data.temperature_frontend}`,
    );
    // Render ui here when data from server is loaded
    renderUI();
    setTimeout(() => {
      hidePreloader();
    }, 300);
  } catch (e) {
    console.error("Cant load settings", e);
  }
}

async function saveSettings(updatedSettings) {
  try {
    const payload = {
      user_id: Number(updatedSettings.userId),
      level: updatedSettings.level,
      temperature_frontend: updatedSettings.temperature,
    };
    const response = await fetch(`${API_BASE_URL}/api/settings/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      showToast("Saved Successfully ✅");
    } else {
      showToast("⚠️ Saving Error");
    }
  } catch (e) {
    console.error("Saving data error: ", e);
    showToast("❌ Network error");
  }
}

async function sendActionToBot(actionName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bot/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
      },
      body: JSON.stringify({
        user_id: Number(appState.userId),
        action: actionName,
      }),
    });

    // Close webapp
    if (response.ok && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  } catch (e) {
    console.error("Action handling error:", e);
  }
}

/* ========================================================
  BOT SETTINGS
=========================================================== */

function updateTemperature() {
  document.getElementById("temperature").textContent = appState.temperature;
}

function updateLevel() {
  document.getElementById("level").value = appState.level;
}

function renderUI() {
  updateLevel();
  updateTemperature();
}

// Update selected level in appState
document.getElementById("level").addEventListener("change", (e) => {
  appState.level = e.target.value;
});

/* ========================================================
  BOT TEMPERATURE BUTTONS
=========================================================== */

const btnPlusTemperature = document.getElementById("increaseTemp");
const btnMinusTemperature = document.getElementById("decreaseTemp");

function updateTemperatureButtons() {
  btnMinusTemperature.disabled = appState.temperature === 1;
  btnPlusTemperature.disabled = appState.temperature === 10;
}

btnPlusTemperature.addEventListener("click", () => {
  if (appState.temperature < 10) {
    appState.temperature++;
    updateTemperature();
    updateTemperatureButtons();
  }
});

btnMinusTemperature.addEventListener("click", () => {
  if (appState.temperature > 1) {
    appState.temperature--;
    updateTemperature();
    updateTemperatureButtons();
  }
});

/* ========================================================
  SAVE SETTINGS BUTTON
=========================================================== */
const saveBtn = document.getElementById("saveSettings");

saveBtn.addEventListener("click", () => {
  saveSettings(appState);
  console.log(appState);
});

/* ========================================================
  COMMANDS BUTTONS
=========================================================== */
const randomQuestBtn = document.getElementById("randomQuestBtn");
randomQuestBtn.addEventListener("click", () => sendActionToBot("ask_me"));

const translateBtn = document.getElementById("translatorBtn");
translateBtn.addEventListener("click", () => sendActionToBot("translator"));

const closeBtn = document.getElementById("closeBtn");
closeBtn.addEventListener("click", () => {
  window.Telegram.WebApp.close();
});

/* ========================================================
  INITIALIZATION
=========================================================== */
loadSettings();
renderUI();
updateTemperatureButtons();
