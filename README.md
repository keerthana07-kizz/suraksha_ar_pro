# 🛡️ Suraksha AI Pro

**Disaster intelligence + infrastructure resilience dashboard**

Suraksha AI Pro is a student-built prototype that demonstrates how location context, disaster scenarios, infrastructure awareness and preparedness actions can be combined into one accessible web experience.

## ✨ What is included

- Cinematic landing page / product-style UI
- Flood, earthquake and cyclone threat models
- Interactive risk scenario controls
- Node.js + Express risk API
- 7-step risk trajectory visualization
- Risk drivers / factor breakdown
- Browser geolocation
- OpenStreetMap / Leaflet map
- Nearby infrastructure demo layer
- Preparedness checklist
- Readiness percentage
- Verification-style certificate record
- Responsive mobile layout
- Clean GitHub-ready project structure

## 🧠 Important project note

The current risk engine is a **demo decision-support model**, not a scientifically validated disaster-prediction system. The score is generated from scenario inputs in `server.js`.

For a production/research version, replace the demo engine with validated data sources and models such as meteorological feeds, seismic feeds, hydrological data, satellite observations and government emergency APIs.

The certificate endpoint creates a cryptographic hash for a demo verification record; it does **not** submit a real blockchain transaction.

## 📁 Structure

```text
suraksha-ai-pro/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── .gitignore
└── README.md
```

## ▶️ Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:5000
```

## 🌐 GitHub

Create a repository and push:

```bash
git init
git add .
git commit -m "Build Suraksha AI Pro disaster intelligence dashboard"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 🚀 Next-level extensions

1. Connect real weather / rainfall APIs.
2. Add live cyclone feeds.
3. Add seismic event feeds.
4. Replace the demo infrastructure layer with Overpass API queries.
5. Add a Python FastAPI ML service for trained models.
6. Add PostgreSQL/MongoDB for incident history.
7. Add authentication and role-based farmer / city / emergency views.
8. Add Telugu and Hindi content with accessibility-first voice alerts.
9. Add PWA/offline emergency mode.
10. Deploy the Express app on a cloud platform.

## ⚠️ Safety

This prototype should not be treated as an official emergency warning system. During a real emergency, follow instructions from local authorities and official emergency services.
