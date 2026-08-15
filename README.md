<div align="center">

<img src="https://img.shields.io/badge/SLIIT-Research%20Project-22c55e?style=for-the-badge&logo=leaflet&logoColor=white" alt="SLIIT Research" />
<img src="https://img.shields.io/badge/Project%20ID-J26--IT--434-0ea5e9?style=for-the-badge" alt="Project ID" />
<img src="https://img.shields.io/badge/Year-4th%20Year%20%7C%201st%20Sem-a78bfa?style=for-the-badge" alt="Year" />
<img src="https://img.shields.io/badge/Status-In%20Progress-fbbf24?style=for-the-badge" alt="Status" />

<br/><br/>

# 🌱 Intelligent Multi-Agent Closed-Loop IoT Ecosystem for Smart Agriculture

**Design and Implementation of an Integrated, Mobile-Controlled IoT Ecosystem for Smart Agriculture:**  
*Bridging the Gaps in Inter-System Closed-Loop Interactivity, Crop-Stage Irrigation, and Predictive Pest Forecasting*

<br/>

> ### 🖥️ [View Interactive System Architecture →](./project-architecture/index.html)
> *Open `architecture.html` in your browser for a full visual walkthrough of the system design, layer breakdown, innovations, and team roles.*

<br/>

[![ESP32](https://img.shields.io/badge/MCU-ESP32-e34f26?style=flat-square&logo=espressif)](https://www.espressif.com/)
[![LoRaWAN](https://img.shields.io/badge/Protocol-LoRaWAN%20%2F%20MQTT-38bdf8?style=flat-square)](https://lora-alliance.org/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-f59e0b?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![FAO-56](https://img.shields.io/badge/Model-FAO--56%20ETo-22c55e?style=flat-square)](http://www.fao.org/)
[![GDD](https://img.shields.io/badge/Algorithm-GDD%20Pest%20Forecast-f87171?style=flat-square)]()

</div>

---

## 🎯 Vision & Mission

| | |
|---|---|
| **🌍 Vision** | To champion a sustainable agricultural future by transforming traditional farms into highly synchronized, climate-resilient, and zero-waste ecosystems through intelligent, closed-loop IoT technology. |
| **🚀 Mission** | To design, develop, and deploy an integrated, cost-effective smart farming platform that unifies irrigation, dynamic fertilization, and pest control under a single, cohesive control loop managed by an intuitive, offline-capable mobile application. |

---

## 🏗️ System Architecture

> 📐 **[Open Full Interactive Architecture →](./project-architecture/index.html)**  
> The interactive page includes color-coded layers, technology tags, and animated flow diagrams.

The system is built on **four tightly integrated layers** forming a complete closed-loop feedback system:

```
┌─────────────────────────────────────────────────────────┐
│  📱  LAYER 4 — Application Layer  (Mobile Dashboard)    │
│        Cross-platform · Offline-first · Manual Override  │
├─────────────────────────────────────────────────────────┤
│  ☁️  LAYER 3 — Cloud & Intelligence Layer               │
│        Firebase · FAO-56 ETo · GDD Model · State Machine │
├─────────────────────────────────────────────────────────┤
│  📶  LAYER 2 — Network Layer                            │
│        LoRaWAN · MQTT/TLS · Wi-Fi · Edge Buffering       │
├─────────────────────────────────────────────────────────┤
│  📡  LAYER 1 — Perception Layer  (Hardware)             │
│        ESP32 · Soil Moisture · EC · DHT22 · Flow Meter   │
└─────────────────────────────────────────────────────────┘
```

<details>
<summary><strong>📡 Layer 1 — Perception Layer (Hardware & Local Sensing)</strong></summary>

Physical sensors and actuators deployed in the field collect real-time environmental data and execute control commands.

| Component | Purpose |
|---|---|
| ESP32 Microcontroller | Edge processing & Wi-Fi / LoRa communication |
| Capacitive Soil Moisture Sensor | Volumetric water content measurement |
| EC (Electrical Conductivity) Sensor | Soil nutrient concentration feedback |
| DHT22 | Ambient temperature & humidity (microclimate) |
| Hall-Effect Liquid Flow Meter | Precise irrigation volume tracking |
| Solid-State Relay | Actuator control for pumps and valves |

</details>

<details>
<summary><strong>📶 Layer 2 — Network Layer (Communication & Telemetry)</strong></summary>

Secure, low-power data pipelines transmit sensor readings to the cloud and relay actuation commands back to field devices.

| Protocol | Use Case |
|---|---|
| LoRaWAN | Long-range, low-power field telemetry |
| MQTT over TLS | Real-time, secure cloud messaging |
| Wi-Fi | Local gateway and mobile app sync |
| Edge Buffering | Offline data persistence during connectivity loss |

</details>

<details>
<summary><strong>☁️ Layer 3 — Cloud & Intelligence Layer</strong></summary>

The brain of the system — hosts the Central Coordination Engine, FAO-56 algorithms, GDD databases, and weather API integrations.

| Component | Role |
|---|---|
| Firebase / ThingsBoard | Real-time database & telemetry backend |
| FAO-56 ETo Algorithm | Dynamic crop-stage water target calculation |
| GDD Database | Pest life-cycle heat unit accumulation |
| Weather API | Rain-skip & forecast-aware irrigation |
| Central Coordination Engine | System State Machine & interlock enforcement |

</details>

<details>
<summary><strong>📱 Layer 4 — Application Layer (Mobile Dashboard)</strong></summary>

A cross-platform mobile app for real-time monitoring, manual override, crop-stage input, and offline-first operation.

| Feature | Description |
|---|---|
| Real-Time Dashboard | Live sensor data visualization & charts |
| Crop-Stage Input | Manual crop phase selection for FAO-56 Kc |
| Manual Override | Direct actuator control from the phone |
| Offline-First Sync | Queues commands and syncs when reconnected |
| Alert System | Push notifications for forecasted pest events |

</details>

---

## 💡 Core Innovations

### 1. 💧 Dynamic Crop-Stage Water Allocation *(FAO-56 Integration)*
Replaces simple static thresholds with dynamic weather-API integration (*Rain-Skips*) and FAO-56 evapotranspiration modeling. Water targets adjust based on the specific crop growth stage (seedling → vegetative → flowering → ripening).

```
ETo (Weather + Microclimate) × Kc (Crop Stage) → Dynamic Irrigation Target
```

### 2. 🧪 Dynamic Fertigation Syncing
Dispenses nutrients based on **real-time soil EC feedback** and soil moisture tension, ensuring optimal root absorption and preventing chemical leaching and runoff.

```
EC(soil) + θ (moisture tension) → Computed Fertigation Dose
```

### 3. 🐛 Microclimate-Driven Predictive Pest Forecasting
Uses DHT22 microclimate data to calculate cumulative **Growing Degree Days (GDD)**. Forecasts pest life-cycles and outbreaks **up to 7 days** before physical emergence — enabling proactive, not reactive, crop protection.

```
∑ GDD = (Tmax + Tmin) / 2 − Tbase  →  Pest Emergence Forecast (D+7)
```

### 4. 🔄 Multi-Agent Closed-Loop Interactivity

A **Central Coordination Engine** maintains a System State Machine and enforces three critical fail-safe interlocks:

| Interlock Rule | Trigger | Action |
|---|---|---|
| 🚫 **Spray–Irrigation Lock** | Pest spray executed | Irrigation blocked for 24 hours |
| 💦 **Leaching Avoidance** | Soil moisture near saturation | Fertilization postponed |
| 🌧️ **Weather-Aware Skip** | Rain forecast via Weather API | Automatic irrigation paused |

---

## 📊 Expected Outcomes & Impact

| Metric | Projected Improvement |
|---|---|
| 💧 **Water Conservation** | 20% – 40% reduction in agricultural water usage |
| 🌿 **Fertilizer Runoff** | 10% – 15% reduction in fertilizer waste |
| 🐛 **Chemical Pesticide Use** | Up to **67% fewer** chemical applications |
| ⚡ **Operational Reliability** | Zero-conflict operations via fail-safe interlocks |
| 📡 **Pest Forecast Window** | Proactive alerts **7 days** before pest emergence |

---

## 👥 Team Workload Distribution

| # | Role | Responsibilities |
|---|---|---|
| 👤 **Member 1** | 🔧 Hardware & Perception Layer Specialist | Sensor integration, actuator wiring, relay control, and field-level calibration |
| 👤 **Member 2** | 🌐 Network & Cloud Infrastructure Specialist | LoRaWAN / MQTT setup, cloud database architecture, and API development |
| 👤 **Member 3** | 📱 Mobile Application & UI/UX Designer | Cross-platform dashboard, agricultural UX, and offline-first sync logic |
| 👤 **Member 4** | 🤖 Intelligence & Synchronization Lead | Central Coordination Engine, FAO-56 & GDD algorithms, and predictive ML models |

---

## 📁 Repository Structure

```
J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture/
│
├── 📄 README.md
│
├── 📂 project-architecture/              ← Multi-page Architecture Documentation Hub
│   ├── 🌐 index.html                    ← Hub landing page (start here)
│   ├── 🌐 system-overview.html          ← Full 4-layer system overview
│   ├── 🌐 data-flow.html                ← End-to-end data flow & decision table
│   ├── 🌐 hardware.html                 ← Hardware components & ESP32 pin map
│   └── 🌐 cloud-intelligence.html       ← Cloud backend, AI models & State Machine
│
├── 📂 system-architecture/              ← Original single-page visualization
│   └── 🌐 architecture.html
│
└── ... (source code & research artifacts coming soon)
```

---

<div align="center">

**SLIIT · Faculty of Computing · 4th Year Research · 2026**

*Designed to champion sustainable, climate-resilient farming through intelligent closed-loop IoT technology.*

</div>
