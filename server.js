const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const profiles = {
  flood: {
    label: "Flood",
    icon: "🌊",
    baseline: 62,
    color: "cyan",
    actions: [
      "Move toward higher ground and avoid low-lying roads.",
      "Never walk or drive through moving floodwater.",
      "Keep your phone charged and share your location with family.",
      "Stay away from bridges, culverts, drains and riverbanks.",
      "Keep essential documents, medicines and water in a go-bag."
    ]
  },
  earthquake: {
    label: "Earthquake",
    icon: "🏔️",
    baseline: 48,
    color: "orange",
    actions: [
      "Drop, cover and hold under a sturdy table or desk.",
      "Stay away from windows, glass and unsecured shelves.",
      "Do not use elevators during or immediately after shaking.",
      "After shaking stops, check for gas, fire and electrical hazards.",
      "Use text messaging when networks are congested."
    ]
  },
  cyclone: {
    label: "Cyclone",
    icon: "🌀",
    baseline: 68,
    color: "violet",
    actions: [
      "Secure windows, doors, loose objects and outdoor equipment.",
      "Move valuables and electronics away from possible water entry.",
      "Stay indoors and away from windows during peak winds.",
      "Follow official evacuation instructions if issued.",
      "Keep emergency lighting, food, water and medicines ready."
    ]
  }
};

const infrastructureTemplates = [
  { type: "bridge", name: "Road Bridge", icon: "🌉", severity: "high" },
  { type: "hospital", name: "Emergency Hospital", icon: "🏥", severity: "safe" },
  { type: "rail", name: "Railway Crossing", icon: "🚆", severity: "medium" },
  { type: "dam", name: "Water Control Structure", icon: "💧", severity: "medium" }
];

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Suraksha AI Pro",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/risk", (req, res) => {
  const { mode = "flood", rainfall = 55, population = 50, infrastructure = 45, preparedness = 60 } = req.body;
  const profile = profiles[mode] || profiles.flood;

  const r = Number(rainfall);
  const p = Number(population);
  const i = Number(infrastructure);
  const prep = Number(preparedness);

  let score = profile.baseline
    + (r - 50) * 0.25
    + (p - 50) * 0.12
    + (i - 50) * 0.18
    - (prep - 50) * 0.22;

  score = Math.max(5, Math.min(98, Math.round(score)));

  const level = score >= 75 ? "critical" : score >= 55 ? "high" : score >= 35 ? "moderate" : "low";

  res.json({
    mode,
    label: profile.label,
    icon: profile.icon,
    score,
    level,
    confidence: Math.min(96, Math.round(72 + Math.abs(score - 50) * 0.35)),
    horizon: mode === "earthquake" ? "preparedness window" : "next 24–72 hours",
    factors: [
      { label: "Environmental pressure", value: Math.round(r) },
      { label: "Population exposure", value: Math.round(p) },
      { label: "Infrastructure sensitivity", value: Math.round(i) },
      { label: "Preparedness buffer", value: Math.round(prep) }
    ],
    trend: Array.from({ length: 7 }, (_, idx) =>
      Math.max(8, Math.min(96, Math.round(score + Math.sin(idx * 1.15) * 15 - idx * 1.5)))
    ),
    actions: profile.actions
  });
});

app.get("/api/infrastructure", (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  // Demo-safe deterministic infrastructure layer.
  // The frontend can replace this with Overpass/OSM data when network access is available.
  const seed = Number.isFinite(lat) && Number.isFinite(lon)
    ? Math.abs(Math.round((lat * 1000) + (lon * 1000)))
    : 42;

  const items = infrastructureTemplates.map((item, idx) => ({
    ...item,
    distance: Number((0.7 + ((seed + idx * 17) % 37) / 10).toFixed(1)),
    status: item.severity === "safe" ? "available" : idx % 2 ? "monitor" : "attention"
  }));

  res.json({ count: items.length, items });
});

app.post("/api/certificate", (req, res) => {
  const { mode = "flood", score = 0, actions = 0, location = "Unknown location" } = req.body;
  const id = `SUR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const hash = crypto.createHash("sha256")
    .update(`${id}|${mode}|${score}|${actions}|${location}`)
    .digest("hex");

  res.json({
    certificateId: id,
    verificationHash: `0x${hash.slice(0, 40)}`,
    issuedAt: new Date().toISOString(),
    validFor: "72 hours",
    note: "Demo verification record — not a real blockchain transaction."
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Suraksha AI Pro running at http://localhost:${PORT}`);
});
