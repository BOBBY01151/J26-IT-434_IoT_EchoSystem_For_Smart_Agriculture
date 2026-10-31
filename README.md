<div align="center">

<img src="https://img.shields.io/badge/SLIIT-Faculty%20of%20Computing-22c55e?style=for-the-badge&logo=leaflet&logoColor=white" alt="SLIIT Research" />
<img src="https://img.shields.io/badge/Project%20ID-J26--IT--434-0ea5e9?style=for-the-badge" alt="Project ID" />
<img src="https://img.shields.io/badge/Research%20Year-4th%20Year%20%7C%201st%20Sem%20(2026)-a78bfa?style=for-the-badge" alt="Year" />
<img src="https://img.shields.io/badge/Status-Completed%20%26%20Synchronized-22c55e?style=for-the-badge" alt="Status" />

<br/><br/>

# 🌱 Intelligent Multi-Agent Closed-Loop IoT Ecosystem for Smart Agriculture
### *Smart Edge-Native Precision Agriculture Manager for Greenhouse Tomato Crops (Solanum lycopersicum)*

**Design and Implementation of an Integrated, Mobile-Controlled IoT Ecosystem for Smart Agriculture:**  
*Bridging the Gaps in Inter-System Closed-Loop Interactivity, Crop-Stage Irrigation, Soil EC/NPK Synchronization, Predictive Pest Forecasting, and Cyber-Physical Conflict Arbitration.*

<br/>

> 🖥️ **[Open Interactive System Architecture Hub →](./project-architecture/index.html)**  
> *Interactive multi-page architectural documentation with layer breakdowns, signal flowcharts, ESP32/Arduino pinouts, and State Machine animations.*

<br/>

[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20(Expo%2052)-61dafb?style=flat-square&logo=react)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20(Python%203.10+)-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Arduino / ESP](https://img.shields.io/badge/Hardware-Arduino%20Uno%20%2B%20ESP--01-00979d?style=flat-square&logo=arduino)](https://www.arduino.cc/)
[![MQTT](https://img.shields.io/badge/Telemetry-MQTT%20over%20TLS-38bdf8?style=flat-square&logo=mqtt)](https://mqtt.org/)
[![FAO-56](https://img.shields.io/badge/Water%20Model-FAO--56%20Penman--Monteith-22c55e?style=flat-square)](http://www.fao.org/)
[![GDD](https://img.shields.io/badge/Predictive%20Model-GDD%20Pest%20Forecast-f87171?style=flat-square)]()
[![Arbitration](https://img.shields.io/badge/Engine-Cyber--Physical%20Arbitration-fbbf24?style=flat-square)]()

</div>

---

## 📖 Executive Summary & Research Scope

Modern precision greenhouse farming often suffers from **fragmented subsystems** where irrigation, nutrient fertigation, and pest control operate as isolated silos. This causes operational conflicts (e.g. irrigating immediately after pesticide spraying washes away costly chemicals into groundwater, or over-fertilizing near soil saturation triggers irreversible nutrient leaching).

Research project **J26-IT-434** addresses these core gaps by designing and deploying an **end-to-end multi-agent closed-loop IoT ecosystem**:
1. **Dynamic FAO-56 Crop-Stage Water Budgeting**: Dynamic evapotranspiration ($ET_c = ET_0 \times K_c$) tailored to tomato phenological phases (*Seedling*, *Vegetative*, *Flowering*, *Ripening*, *Harvest*).
2. **Real-time Soil NPK & Anti-Leaching Protection**: Live soil $N$, $P$, $K$, and volumetric moisture monitoring with automated threshold guards.
3. **7-Day Predictive Pest Forecasting**: Cumulative Growing Degree Days (GDD) heat accumulation model forecasting pest emergence up to a week prior to physical manifestation.
4. **Automated Inter-System Fail-Safe Interlocks**: A Central State Machine enforcing mutual exclusion across spraying, irrigation, and fertilization cycles.
5. **Cyber-Physical Conflict Arbitration**: Resolves operational disputes between AI edge predictions and human farmer manual overrides to prevent crop stress and root waterlogging.

---

## 🏛️ Ecosystem Repositories Map

The project is structured into **three synchronized repositories** comprising the perception hardware, intelligence backend, and mobile management dashboard:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           J26-IT-434 SMART AGRICULTURE ECOSYSTEM                                │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
      ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
      ▼                                          ▼                                          ▼
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ 📱 Mobile Application &   │      │ ☁️ Cloud & Intelligence   │      │ 📡 Hardware Firmware &    │
│    Architecture Hub       │      │    Backend API            │      │    Sensor IoT Bridge      │
├───────────────────────────┤      ├───────────────────────────┤      ├───────────────────────────┤
│ • SmartFarm (Expo v52)    │◄────►│ • FastAPI (Python 3.10+)  │◄────►│ • Arduino Uno (Bare-Metal)│
│ • Live Farmer Dashboard   │ HTTP │ • FAO-56 & VPD Engines    │ MQTT │ • ESP-01 Wi-Fi Bridge     │
│ • Closed-Loop Controls    │ REST │ • ML Disease Diagnostics  │ TLS  │ • NPK, DHT11, Flow Meter  │
│ • Interactive Hub (.html) │      │ • Arbitration Engine      │      │ • Solenoid Valve Relay    │
│ [Primary Repository]      │      │ [Backend Repository]      │      │ [Firmware Repository]     │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

1. **📱 [J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture](./)** *(This Repository)*:
   - Mobile Application (`SmartFarm/`) built with React Native & Expo SDK 52.
   - Interactive Architecture Hub (`project-architecture/`) & System Visualizations.
2. **☁️ [J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture-Backend](../J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture-Backend)**:
   - FastAPI server with SQLite/PostgreSQL, SQLAlchemy 2.0 ORM, and Pydantic v2 schemas.
   - Hosts the Arbitration Engine (`/api/v1/arbitration/resolve`), FAO-56 calculator, and disease classifier.
3. **📡 [J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture_Firmware_For_IoT](../J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture_Firmware_For_IoT)**:
   - Hardware source code for Arduino Uno (`uno/agro/agro.ino`) and ESP-01 MQTT bridge (`esp-01.ino`).

---

## 🏗️ 4-Tier Cyber-Physical System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📱 LAYER 4 — APPLICATION & DECISION LAYER  (Cross-Platform React Native Expo App)             │
│        Live Telemetry Dashboard · Irrigation Control · NPK Hub · GDD Pest AI · Manual Override  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ☁️ LAYER 3 — INTELLIGENCE & COORDINATION LAYER  (FastAPI Backend & State Machine)               │
│        FAO-56 ETc Engine · Tetens VPD Model · GDD Accumulator · Cyber-Physical Arbitration       │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  📶 LAYER 2 — NETWORK & TELEMETRY INGESTION LAYER  (Secure Cloud Messaging)                     │
│        MQTT over TLS (mqtt.smartaquamarket.com) · Wi-Fi Bridge · Edge Buffering · REST API      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  📡 LAYER 1 — PERCEPTION & ACTUATION LAYER  (Field Hardware)                                    │
│        Arduino Uno · ESP-01 · DHT11 · NPK Analog Sensor · Hall Flow Meter · Solenoid Relay · OLED│
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<details>
<summary><strong>📡 Layer 1 — Perception & Actuation Layer (Field Hardware)</strong></summary>

The edge layer consists of physical sensing probes and electromechanical actuators deployed in the root zone and canopy:

| Component | Interface / Pin | Function |
|---|---|---|
| **ATmega328P (Arduino Uno)** | Core MCU | Bare-metal ISR pulse counting, ADC reading, and OLED rendering |
| **ESP-01 (ESP8266)** | UART 9600 Baud | Wi-Fi bridge publishing sensor telemetry to Cloud MQTT |
| **DHT11 Microclimate Sensor** | Digital Pin 4 (PD4) | Ambient air temperature (°C) & relative humidity (%) |
| **Hall-Effect Liquid Flow Meter** | Interrupt 0 / Pin 2 (PD2) | Water flow rate monitoring (450 pulses/liter calibration) |
| **Soil NPK Sensor** | Analog Pins A0, A1, A2 | Nitrogen (N), Phosphorus (P), Potassium (K) analog counts |
| **Capacitive Soil Moisture Probe** | Analog Input | Root-zone volumetric water content (VWC %) |
| **Solenoid Water Valve Relay** | Digital Pin 13 (PB5) | Closed-loop 12V DC water valve actuation |
| **SSD1306 OLED Display (128x64)** | I2C (Pins A4, A5) | Local field readout of temperature, flow, NPK, and Wi-Fi link |

</details>

<details>
<summary><strong>📶 Layer 2 — Network & Telemetry Layer (Communications)</strong></summary>

Ensures reliable, low-power telemetry transmission between edge controllers and the cloud backend:

| Protocol | Broker / Host | Topics & Telemetry Channels |
|---|---|---|
| **MQTT over TLS** | `mqtt.smartaquamarket.com:1883` | `agro/out/<mac>/temp`, `agro/out/<mac>/hum`, `agro/out/<mac>/flow`, `agro/out/<mac>/n`, `agro/out/<mac>/p`, `agro/out/<mac>/k`, `agro/out/<mac>/solenoid` |
| **Inbound Actuator Control** | Subscribed Topic | `agro/in/<mac>/solenoid` (Payload `0` or `1` for valve control) |
| **Retained LWT & Link Status**| Retained Topic | `agro/out/<mac>/link` (`wifi:1,mqtt:1` or `wifi:0,mqtt:0`) |
| **RESTful HTTP / JSON** | FastAPI Gateway | Endpoints for mobile synchronization, image uploads, and analytics |

</details>

<details>
<summary><strong>☁️ Layer 3 — Intelligence & Coordination Layer (Backend API)</strong></summary>

Hosts the core algorithms, cyber-physical safety policies, and machine learning models:

| Service / Engine | Formulation / Technology | Purpose |
|---|---|---|
| **FAO-56 Irrigation Engine** | $ET_c = ET_0 \times K_c$ | Computes exact daily water volume required for tomato growth phase |
| **Dynamic Fertigation Engine** | $V_{\text{dose}} = (\Delta EC) \times V_{\text{root}} \times k \times f(\theta)$ | Automatically meters nutrient delivery based on soil moisture absorption and EC targets |
| **Microclimate VPD Analyzer** | Tetens Equation | Calculates atmospheric dryness (VPD) to identify transpiration stress |
| **GDD Pest Forecaster** | $\sum GDD = \frac{T_{max} + T_{min}}{2} - T_{base}$ | Proactively calculates heat unit accumulation for pest life-cycles |
| **Arbitration Engine** | Dynamic Policy Rules | Resolves conflicts between AI predictions and farmer manual overrides |
| **Plant Health Classifier** | MobileNetV2 Pipeline | 224x224 RGB image analysis diagnosing early blight, mold, and deficiency |

</details>

<details>
<summary><strong>📱 Layer 4 — Application Layer (SmartFarm Mobile Dashboard)</strong></summary>

An intuitive, offline-capable mobile application crafted for farmers:

| Screen / Feature | Path | Function |
|---|---|---|
| **Home Dashboard** | `src/app/(tabs)/index.tsx` | Overview of greenhouse microclimate, interlocks, water targets, and pest risk |
| **Irrigation & Pump** | `src/app/(tabs)/irrigation.tsx` | AI closed-loop vs manual pump mode, anomaly detection, and event history |
| **Fertilizer & NPK Hub** | `src/app/(tabs)/fertilizer.tsx` | Live NPK sensor telemetry, phenological growth stage guidelines, and tasks |
| **Pest & Plant Health** | `src/app/(tabs)/plant-health.tsx`| 24-hour spray lockout timer, leaf photo diagnostic tool, and field reports |
| **Farm Profile** | `src/app/(tabs)/farm.tsx` | Facility profile, hardware node registry, zone configurations, and team metadata |
| **Notifications** | `src/app/notifications.tsx` | Filterable high-priority notifications for critical microclimate & interlock alerts |

</details>

---

## 🔬 Scientific Formulations & Core Innovations

### 1. 💧 Dynamic Crop-Stage Water Allocation (FAO-56 Penman–Monteith)
Static irrigation timers result in either drought stress or root asphyxiation. Our engine calculates reference evapotranspiration ($ET_0$) and modulates daily volume ($V_{irr}$) using stage-specific crop coefficients ($K_c$):

$$ET_c = ET_0 \times K_c(\text{Stage})$$

$$V_{irr} = \left(ET_c \times A_{canopy}\right) + \Delta \theta_{root}$$

*Tomato Phenological Stage Coefficients ($K_c$):*
- **Seedling**: $K_c = 0.60$ (Target soil moisture: 25%–35%)
- **Vegetative**: $K_c = 0.80$ (Target soil moisture: 30%–40%)
- **Flowering**: $K_c = 1.15$ (Target soil moisture: 35%–45% — High transpiration period)
- **Ripening**: $K_c = 0.90$ (Target soil moisture: 30%–38%)
- **Harvest**: $K_c = 0.70$ (Target soil moisture: 25%–32%)

---

### 2. 🧪 Dynamic Soil Moisture-Driven Automated Fertigation Model *(Tomato Crop Specific)*
Rather than applying arbitrary or fixed calendar fertilizer recipes that lead to root salt burn or groundwater contamination, our closed-loop fertilization model continuously ingests real-time **Volumetric Soil Moisture Content ($\theta$, % VWC)** and **Root-Zone Electrical Conductivity ($EC$, mS/cm / NPK)** from the field sensors.

#### A. Soil Moisture-Governed Absorption Window
Nutrient uptake in tomato plants is biologically coupled with soil water matric potential. The system automatically gates fertilizer delivery according to the real-time soil moisture status:

$$\text{Fertigation State} = \begin{cases} 
\text{BLOCKED (Salt Burn Hazard)}, & \theta < \theta_{\text{min\_uptake}} \quad (< 25\%) \\
\text{ACTIVE (Automated Micro-Dosing)}, & \theta_{\text{min\_uptake}} \le \theta \le \theta_{\text{max\_uptake}} \quad (30\% - 45\%) \\
\text{SUPPRESSED (Anti-Leaching Interlock)}, & \theta \ge \theta_{\text{saturation}} \quad (\ge 85\%)
\end{cases}$$

- **$\theta < 25\%$ (Critically Dry Soil)**: Fertilization is automatically locked out to prevent osmotic shock and fertilizer root burn; freshwater irrigation is scheduled first to restore root turgor pressure.
- **$30\% \le \theta \le 45\%$ (Optimal Uptake Window)**: Root hair transpiration and capillary pressure are at peak efficiency; the model computes and automatically dispenses calibrated liquid fertilizer micro-doses directly into the irrigation line.
- **$\theta \ge 85\%$ (Near Field Capacity)**: The **Anti-Leaching Guard** activates automatically, blocking all fertilizer dispensing to ensure zero chemical runoff into groundwater.

#### B. Automated Nutrient Dose Formulation ($V_{\text{dose}}$)
For greenhouse tomato crops (*Solanum lycopersicum*), the automated fertilizer dosing engine calculates the required liquid stock solution volume based on the electrical conductivity deficit ($\Delta EC$) and current soil moisture:

$$V_{\text{dose}} = \left(EC_{\text{target}}(\text{Stage}) - EC_{\text{soil}}\right) \times V_{\text{root}} \times k_{\text{calibration}} \times f(\theta)$$

Where:
- $EC_{\text{target}}(\text{Stage})$: Target electrical conductivity for the active tomato phenological stage.
- $EC_{\text{soil}}$: Real-time root-zone EC reading (or calibrated NPK stoichiometric sum from sensor inputs).
- $V_{\text{root}}$: Active root-zone soil volume ($200\text{ m}^2$ greenhouse canopy).
- $k_{\text{calibration}}$: Dilution factor of the concentrated stock solution (A+B mix).
- $f(\theta) = \frac{\theta - \theta_{\text{min}}}{\theta_{\text{optimal}} - \theta_{\text{min}}}$: Moisture scaling factor ensuring optimal solute diffusion without saturating the root environment.

#### C. Tomato Phenological Stage NPK & Moisture Target Profiles

| Growth Stage | Target Moisture ($\theta$) | Target EC | Nitrogen (N) | Phosphorus (P) | Potassium (K) | Agronomic Focus |
|:---|:---|:---|:---|:---|:---|:---|
| 🌱 **Seedling** | $25\% - 35\%$ | $1.2 - 1.5\text{ mS/cm}$ | $100–140\text{ mg/kg}$ | $50–80\text{ mg/kg}$ | $120–160\text{ mg/kg}$ | Early rootlet formation; mild nutrient concentration to avoid root burn |
| 🌿 **Vegetative** | $30\% - 40\%$ | $1.5 - 1.8\text{ mS/cm}$ | $160–220\text{ mg/kg}$ | $60–100\text{ mg/kg}$ | $180–240\text{ mg/kg}$ | High nitrogen demand for foliage biomass & chlorophyll synthesis |
| 🌸 **Flowering** | $35\% - 45\%$ | $1.8 - 2.2\text{ mS/cm}$ | $140–180\text{ mg/kg}$ | $90–140\text{ mg/kg}$ | $240–320\text{ mg/kg}$ | Potassium & phosphorus surge to ensure flower truss set & blossom-end rot prevention |
| 🍅 **Ripening** | $30\% - 38\%$ | $2.0 - 2.4\text{ mS/cm}$ | $120–160\text{ mg/kg}$ | $80–120\text{ mg/kg}$ | $280–360\text{ mg/kg}$ | Maximum potassium accumulation to boost fruit brix (sweetness), firmness & size |
| 🧺 **Harvest** | $25\% - 32\%$ | $1.4 - 1.8\text{ mS/cm}$ | $100–140\text{ mg/kg}$ | $60–90\text{ mg/kg}$ | $200–260\text{ mg/kg}$ | Tapering fertilization to maintain vine longevity and prevent post-harvest rot |

#### D. End-to-End Closed-Loop Actuation Workflow
```
[Soil Moisture & NPK Probes] ──► [Arduino Uno + ESP-01 Bridge]
                                              │ (MQTT Telemetry: agro/out/<mac>/n,p,k)
                                              ▼
                                 [Cloud Coordination Engine]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         Is θ in 30%–45% window?                             Is θ ≥ 85%?
          ├── NO (Dry <25%): Trigger water first             └── YES: ENGAGE ANTI-LEACHING LOCK
          └── YES: Compute V_dose via ΔEC                             (Suppress nutrient pump)
                      │
                      ▼
        [Actuate Dosing Relay (Pin 26)] ──► [Inject Nutrients into Manifold]
                      │
                      ▼
        [Monitor EC Delta until target achieved] ──► [Auto-Shutoff Relay]
```

---

### 3. 🐛 Microclimate-Driven Predictive Pest Forecasting (GDD Model)
Insect emergence is biologically governed by accumulated environmental heat units rather than calendar days. By capturing continuous microclimate readings from the DHT11, the system computes cumulative Growing Degree Days:

$$GDD_{daily} = \left(\frac{T_{max} + T_{min}}{2}\right) - T_{base}$$

Where $T_{base} = 10.0^\circ\text{C}$ for greenhouse whiteflies (*Bemisia tabaci*) and leaf miners. When cumulative $GDD \ge \text{Threshold}$ ($540\text{ GDD}$), proactive alerts are sent to the mobile app **up to 7 days before physical crop infestation**.

---

### 4. 🔄 Multi-Agent Closed-Loop Fail-Safe Interlocks

A centralized State Machine arbitrates between actuation agents to prevent hazardous operational conflicts:

| Interlock Name | Trigger Condition | Automated Closed-Loop Action |
|---|---|---|
| 🚫 **Spray–Irrigation Lock** | Farmer triggers or records pesticide spray | Blocks irrigation solenoids for **24 hours** to prevent chemical wash-off |
| 💦 **Anti-Leaching Guard** | Volumetric soil moisture $\ge 85\%$ | Halts fertilization dosing to prevent fertilizer runoff and leaching |
| 🌧️ **Weather Rain-Skip** | OpenWeather API predicts rainfall $\ge 60\%$ | Suspends automatic irrigation cycles until weather clears |

---

### 5. ⚖️ Cyber-Physical Conflict Arbitration Engine
When a farmer manually overrides automated Edge AI pump predictions, operational hazards may occur. The backend arbitration service (`/api/v1/arbitration/resolve`) inspects environmental telemetry and applies safety policies:
- **Over-Irrigation Hazard Policy**: If the farmer requests water but soil moisture is $\ge 48\%$, the override is **blocked** to prevent root asphyxiation and fungal outbreak.
- **Under-Irrigation Drought Policy**: If the farmer stops irrigation but soil moisture is $< 30\%$ (wilting point), the AI's emergency water dose is **enforced**.
- **Safe Zone**: When within safe boundaries, human farmer authority is respected and logged in the audit trail.

---

## 👥 Research Team Workload Distribution

**SLIIT · Faculty of Computing · 4th Year Research Project `J26-IT-434` (2026)**

| Member | Role | Research Layer & Specialization | Key Contributions |
|:---|:---|:---|:---|
| 👤 **Member 1** | **Hardware & Perception Specialist** | **Layer 1 — Perception Layer** | • Arduino Uno bare-metal firmware (`agro.ino`)<br/>• ESP-01 Wi-Fi MQTT bridge (`esp-01.ino`)<br/>• NPK, DHT11, Flow meter & Solenoid wiring |
| 👤 **Member 2** | **Network & Cloud Specialist** | **Layer 2 & 3 — Network & Backend** | • Cloud MQTT broker configuration over TLS<br/>• FastAPI telemetry ingestion pipelines<br/>• SQLAlchemy ORM database architecture |
| 👤 **Member 3** | **Mobile App & UI/UX Specialist** | **Layer 4 — Application Layer** | • SmartFarm cross-platform React Native app<br/>• Real-time farmer telemetry dashboard & charts<br/>• Closed-loop mode switchers & alert UI |
| 👤 **Member 4** | **Intelligence & Sync Lead** | **Layer 3 — Intelligence Layer** | • FAO-56 crop-stage water requirement model<br/>• GDD predictive pest emergence algorithms<br/>• Cyber-physical conflict arbitration engine |

---

## 📁 Repository Directory Structure

```
J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture/
├── 📄 README.md                            # Comprehensive Ecosystem Documentation (This file)
│
├── 📂 SmartFarm/                           # React Native / Expo Mobile Application
│   ├── 📂 assets/                          # App branding, icons, and splash screens
│   ├── 📂 src/
│   │   ├── 📂 app/                         # Expo Router screens
│   │   │   ├── 📄 _layout.tsx              # Root Navigation Stack layout
│   │   │   ├── 📄 notifications.tsx        # Real-time alerts and notification center
│   │   │   ├── 📄 disease-result.tsx       # AI foliar disease diagnostic result modal
│   │   │   └── 📂 (tabs)/                  # 5-Tab Primary Farmer Dashboard
│   │   │       ├── 📄 _layout.tsx          # Tab bar layout & icons
│   │   │       ├── 📄 index.tsx            # 1. Home: Overview, Interlocks, Microclimate & Targets
│   │   │       ├── 📄 irrigation.tsx       # 2. Irrigation: AI Closed-Loop & Solenoid Controls
│   │   │       ├── 📄 fertilizer.tsx       # 3. Fertilizer: Live NPK Telemetry & Stage Targets
│   │   │       ├── 📄 plant-health.tsx     # 4. Plant Health: Spray Lockout, GDD & Image AI
│   │   │       └── 📄 farm.tsx             # 5. Profile: Nodes, Zones, Calibrations & Team
│   │   ├── 📂 components/                  # Reusable UI component library
│   │   │   ├── 📄 AppHeader.tsx            # Standardized header with MQTT badge
│   │   │   ├── 📄 StatusBadge.tsx          # Status indicators (Online, Alert, Armed)
│   │   │   ├── 📄 MetricCard.tsx           # Telemetry metric cards
│   │   │   └── ...                         # SensorGrid, DeviceCard, Buttons
│   │   ├── 📂 constants/
│   │   │   └── 📄 theme.ts                 # Design tokens (Colors, Typography, Radius, Shadow)
│   │   ├── 📂 data/                        # Static seeds and mock telemetry
│   │   ├── 📂 services/                    # Local services and agent simulation loops
│   │   └── 📂 types/                       # TypeScript interfaces (1:1 with Backend Schemas)
│   ├── 📄 app.json                         # Expo configuration
│   ├── 📄 package.json                     # Node.js dependencies
│   └── 📄 tsconfig.json                    # Strict TypeScript configuration
│
├── 📂 project-architecture/                # Multi-page Interactive Web Architecture Hub
│   ├── 🌐 index.html                       # Hub Landing Page
│   ├── 🌐 system-overview.html             # Comprehensive 4-layer architectural breakdown
│   ├── 🌐 data-flow.html                   # Signal flow diagrams and decision matrices
│   ├── 🌐 hardware.html                    # Hardware schematics, ESP32 pinouts & sensor specs
│   └── 🌐 cloud-intelligence.html          # State Machine, FAO-56 & GDD algorithm documentation
│
└── 📂 system-architecture/                 # Original system architecture blueprints
    └── 🌐 architecture.html
```

---

## 🚀 Quick Start & Installation

### 1. Mobile Application (`SmartFarm`)
```bash
# Navigate to the mobile app directory
cd SmartFarm

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```
- Press `i` to launch in the **iOS Simulator** (macOS).
- Press `a` to launch in the **Android Emulator**.
- Press `w` to open in a **Web Browser**.
- Scan the terminal QR code using **Expo Go** on your physical iPhone or Android device.

---

### 2. Backend Intelligence Server (`FastAPI`)
```bash
# Navigate to the backend directory
cd ../J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture-Backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the Uvicorn ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 3. Edge Firmware Flashing (`Arduino Uno` & `ESP-01`)
```bash
# Firmware repository location:
cd ../J26-IT-434_IoT_EchoSystem_For_Smart_Agriculture_Firmware_For_IoT

# 1. Flash Arduino Uno via Arduino IDE or avr-gcc:
#    Open 'uno/agro/agro.ino' -> Target: Arduino Uno -> Port: /dev/ttyACM0

# 2. Flash ESP-01 Wi-Fi bridge via ESP Flash Tool:
#    Open 'esp-01.ino' -> Target: Generic ESP8266 Module -> Upload
```

---

## 📊 Expected Agronomic & Sustainability Impact

| Performance Metric | Traditional Approach | J26-IT-434 Ecosystem | Research Impact |
|:---|:---|:---|:---|
| 💧 **Irrigation Water Usage** | Static scheduled timer | Dynamic FAO-56 ($ET_0 \times K_c$) | **20% – 40% water conservation** |
| 🌿 **Fertilizer Runoff** | Fixed calendar recipes | Soil NPK feedback & Anti-Leaching | **10% – 15% reduction in nutrient waste** |
| 🐛 **Chemical Pesticide Use** | Reactive spraying after infestation | 7-day GDD predictive emergence alerts | **Up to 67% reduction in pesticide sprays** |
| ⚡ **Operational Conflicts** | Uncoordinated manual interventions | Central State Machine & Interlocks | **Zero conflicting actuator commands** |
| 🛡️ **Crop Root Health** | Vulnerable to waterlogging/wilting | Cyber-Physical Conflict Arbitration | **Guaranteed safe root-zone boundaries** |

---

<div align="center">

**SLIIT · Faculty of Computing · 4th Year Research · 2026**  
*Intelligent Multi-Agent Closed-Loop IoT Ecosystem for Smart Agriculture (`J26-IT-434`)*

</div>
