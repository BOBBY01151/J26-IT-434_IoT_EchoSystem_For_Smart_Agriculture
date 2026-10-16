// Sensor reading types

export type SensorId =
  | 'soilMoisture'
  | 'airTemperature'
  | 'relativeHumidity'
  | 'solarRadiation'
  | 'atmosphericPressure'
  | 'evapotranspiration'
  | 'vpd';

export interface SensorReading {
  id: SensorId;
  label: string;
  value: number;
  unit: string;
  iconName: string; // Ionicons name
  status: 'normal' | 'warning' | 'danger';
  description: string;
}

export interface SensorSnapshot {
  timestamp: string;
  readings: SensorReading[];
}
