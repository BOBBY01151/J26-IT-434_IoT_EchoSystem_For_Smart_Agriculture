import type { SensorReading } from '../types/sensor';

// Seven environmental model-input sensors with demonstration readings.
// These values are static mock data — no live sensor is connected.
export const mockSensorReadings: SensorReading[] = [
  {
    id: 'soilMoisture',
    label: 'Soil Moisture',
    value: 31.4,
    unit: '%',
    iconName: 'water-outline',
    status: 'normal',
    description: 'Volumetric water content',
  },
  {
    id: 'airTemperature',
    label: 'Air Temperature',
    value: 29.2,
    unit: '°C',
    iconName: 'thermometer-outline',
    status: 'normal',
    description: 'Ambient greenhouse air',
  },
  {
    id: 'relativeHumidity',
    label: 'Relative Humidity',
    value: 68,
    unit: '%',
    iconName: 'cloud-outline',
    status: 'normal',
    description: 'Ambient air humidity',
  },
  {
    id: 'solarRadiation',
    label: 'Solar Radiation',
    value: 520,
    unit: 'W/m²',
    iconName: 'sunny-outline',
    status: 'normal',
    description: 'Incoming solar irradiance',
  },
  {
    id: 'atmosphericPressure',
    label: 'Atm. Pressure',
    value: 1008.4,
    unit: 'hPa',
    iconName: 'speedometer-outline',
    status: 'normal',
    description: 'Atmospheric pressure',
  },
  {
    id: 'evapotranspiration',
    label: 'Evapotranspiration',
    value: 3.2,
    unit: 'mm/day',
    iconName: 'trending-up-outline',
    status: 'normal',
    description: 'Reference ETo (FAO-56)',
  },
  {
    id: 'vpd',
    label: 'Vapor Pressure Deficit',
    value: 1.25,
    unit: 'kPa',
    iconName: 'analytics-outline',
    status: 'normal',
    description: 'Atmospheric dryness (VPD)',
  },
];

// The four primary metrics shown on the Home dashboard
export const mockKeyMetrics = mockSensorReadings.slice(0, 4);
