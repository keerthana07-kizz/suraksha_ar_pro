const state = {
  mode: "flood",
  location: null,
  risk: null,
  actions: new Set(),
  map: null,
  marker: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  bindUI();
  checkAPI();
  runAnalysis();
});

function bindUI() {
  document.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      state.mode = card.dataset.mode;
      state.actions.clear();
      runAnalysis();
    });
  });

  ["rain", "population", "infrastructure", "preparedness"].forEach(id => {
    $(id).addEventListener("input", () => {
      $(`${id === "rain" ? "rain" : id}Val`).textContent = $(id).value;
    });
  });

  $("analyzeBtn").addEventListener("click", runAnalysis);
  $("launchBtn").addEventListener("click", () => $("intelligence").scrollIntoView({ behavior: "smooth" }));
  $("locateBtn").addEventListener("click", detectLocation);
  $("certBtn").addEventListener("click", generateCertificate);
}

async function checkAPI() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    $("apiStatus").textContent = data.status === "online" ? "API / ONLINE" : "API / OFFLINE";
  } catch {
    $("apiStatus").textContent = "LOCAL / DEMO";
  }
}

async function runAnalysis() {
  const payload = {
    mode: state.mode,
    rainfall: $("rain").value,
    population: $("population").value,
    infrastructure: $("infrastructure").value,
    preparedness: $("preparedness").value
  };

  try {
    const res = await fetch("/api/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    state.risk = await res.json();
    renderRisk();
    renderActions();
  } catch {
    $("riskExplanation").textContent = "Backend unavailable. Start the Node server to run the risk engine.";
  }
}

function renderRisk() {
  const r = state.risk;
  $("riskNumber").textContent = r.score;
  $("riskBar").style.width = `${r.score}%`;
  $("riskLevel").textContent = r.level.toUpperCase();
  $("confidence").textContent = `${r.confidence}% confidence`;
  $("riskExplanation").textContent =
    `${r.icon} ${r.label} scenario • ${r.horizon}. The score combines the selected environmental, exposure, infrastructure and preparedness inputs.`;

  $("miniChart").innerHTML = r.trend.map(v =>
    `<span class="chart-bar" style="height:${Math.max(12, v)}%"></span>`
  ).join("");

  $("factorList").innerHTML = r.factors.map(f => `
    <div class="factor-row">
      <div><span>${f.label}</span><b>${f.value}%</b></div>
      <div class="factor-track"><i style="width:${f.value}%"></i></div>
    </div>
  `).join("");

  $("actionTitle").textContent = `${r.label} response checklist`;
}

function renderActions() {
  const actions = state.risk.actions;
  $("actions").innerHTML = actions.map((action, i) => `
    <div class="action-row ${state.actions.has(i) ? "done" : ""}" data-index="${i}">
      <div class="check">✓</div><span>${action}</span>
    </div>
  `).join("");

  document.querySelectorAll(".action-row").forEach(row => {
    row.addEventListener("click", () => {
      const index = Number(row.dataset.index);
      state.actions.has(index) ? state.actions.delete(index) : state.actions.add(index);
      renderActions();
      updateCertificateScore();
    });
  });
  updateCertificateScore();
}

function updateCertificateScore() {
  const score = Math.round((state.actions.size / 5) * 100);
  $("actionCount").textContent = `${state.actions.size} / 5`;
  $("certScore").textContent = `${score}%`;
}

function initMap() {
  state.map = L.map("map", { zoomControl: false }).setView([20.5937, 78.9629], 5);
  L.control.zoom({ position: "bottomright" }).addTo(state.map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);
}

async function detectLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  $("locateBtn").textContent = "◎ Locating…";

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    state.location = { lat, lon };

    state.map.setView([lat, lon], 13);
    if (state.marker) state.map.removeLayer(state.marker);
    state.marker = L.marker([lat, lon]).addTo(state.map).bindPopup("<b>Suraksha command point</b>").openPopup();

    let city = "Your location";
    try {
      const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`).then(r => r.json());
      city = geo.address?.city || geo.address?.town || geo.address?.state || city;
    } catch {}

    $("heroLocation").textContent = city;
    $("mapLocation").textContent = city;
    $("locateBtn").textContent = "✓ Location locked";
    await loadInfrastructure(lat, lon);
  }, () => {
    $("locateBtn").textContent = "◎ Detect location";
    alert("Location permission was not granted. You can still explore the simulation dashboard.");
  }, { enableHighAccuracy: true, timeout: 10000 });
}

async function loadInfrastructure(lat, lon) {
  try {
    const res = await fetch(`/api/infrastructure?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    $("infraCount").textContent = data.count;

    $("infraItems").innerHTML = data.items.map(item => `
      <div class="infra-item">
        <div class="ico">${item.icon}</div>
        <div><b>${item.name}</b><small>${item.distance} km away</small></div>
        <em>${item.status}</em>
      </div>
    `).join("");
  } catch {
    $("infraItems").innerHTML = `<div class="empty">Infrastructure service unavailable.</div>`;
  }
}

async function generateCertificate() {
  if (state.actions.size < 5) {
    alert("Complete all 5 preparedness actions before generating the certificate.");
    return;
  }

  const location = state.location
    ? `${state.location.lat.toFixed(4)}, ${state.location.lon.toFixed(4)}`
    : "Simulation location";

  const res = await fetch("/api/certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: state.mode,
      score: state.risk?.score || 0,
      actions: state.actions.size,
      location
    })
  });

  const cert = await res.json();
  $("certResult").classList.remove("hidden");
  $("certResult").innerHTML =
    `<b>${cert.certificateId}</b><br>Verification: ${cert.verificationHash}<br>${cert.note}`;
}
