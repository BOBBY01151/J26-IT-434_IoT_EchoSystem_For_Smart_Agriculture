# SmartFarm — Smart Edge-Native Farm Manager

Frontend prototype for **Smart Edge-Native Farm Manager for Tomato Crops** (SLIIT 4th Year Research Project `J26-IT-434`).

## Tech Stack
- **Framework**: React Native with [Expo](https://expo.dev) (SDK 52)
- **Routing**: [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Language**: TypeScript (Strict typing)
- **Styling**: React Native `StyleSheet` with central theme tokens (`src/constants/theme.ts`)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Image Picker**: `expo-image-picker`

---

## Project Structure

```
SmartFarm/
├── assets/                  # App icons and splash assets
├── src/
│   ├── app/                 # Expo Router file-based screens
│   │   ├── _layout.tsx      # Root Stack layout
│   │   ├── notifications.tsx# Activity & notifications screen
│   │   ├── disease-result.tsx# Future model specifications
│   │   └── (tabs)/          # 5-Tab bottom navigation
│   │       ├── _layout.tsx  # Tabs layout
│   │       ├── index.tsx    # 1. Home Dashboard
│   │       ├── irrigation.tsx # 2. Irrigation Monitor & History
│   │       ├── fertilizer.tsx # 3. Fertilizer Reminders & NPK Status
│   │       ├── plant-health.tsx # 4. Image Inspection & Diagnostic Prep
│   │       └── farm.tsx     # 5. Farm, Greenhouse & Device Profile
│   ├── components/          # Reusable UI components
│   │   ├── AppHeader.tsx
│   │   ├── DeviceStatusCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FarmSelector.tsx
│   │   ├── IrrigationSummaryCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── ScreenContainer.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── SensorGrid.tsx
│   │   ├── SensorRow.tsx
│   │   └── StatusBadge.tsx
│   ├── constants/
│   │   └── theme.ts         # Colors, typography, spacing, and radius tokens
│   ├── data/                # Static mock data modules
│   │   ├── mockFarm.ts
│   │   ├── mockFertilizer.ts
│   │   ├── mockIrrigation.ts
│   │   ├── mockNotifications.ts
│   │   └── mockSensors.ts
│   ├── types/               # TypeScript interface definitions
│   │   ├── farm.ts
│   │   ├── fertilizer.ts
│   │   ├── irrigation.ts
│   │   ├── notification.ts
│   │   └── sensor.ts
│   └── utils/
│       └── formatters.ts    # Formatting helpers
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Navigate to the project directory
```bash
cd SmartFarm
```

### 2. Install dependencies (if not already installed)
```bash
npm install
```

### 3. Start development server
```bash
npx expo start
```

- Press `i` to open in iOS Simulator (macOS with Xcode)
- Press `a` to open in Android Emulator
- Press `w` to open in Web browser
- Scan the QR code using the **Expo Go** app on your physical iOS or Android device.
