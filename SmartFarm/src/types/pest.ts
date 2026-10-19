// Types for Pest Control & Edge AI Forecasting (IT23327108)

export type TargetPredictionType =
  | 'Healthy_Crop'
  | 'Low_Infestation'
  | 'Moderate_Infestation'
  | 'Severe_Infestation';

export interface ESP32Telemetry {
  id?: number;
  temperature: number;
  humidity: number;
  target_prediction: TargetPredictionType;
  anomaly_score: number;
  timestamp?: string;
}

export interface SprayEvent {
  id: number | string;
  timestamp: string;
  notes?: string;
  lockout_active: boolean;
  lockout_hours_remaining: number;
}

export interface PestDashboardData {
  latest_prediction: TargetPredictionType;
  temperature: number;
  humidity: number;
  anomaly_score: number;
  is_anomaly_alert: boolean;
  last_telemetry_timestamp?: string;
  is_spray_lockout_active: boolean;
  lockout_remaining_hours: number;
  last_spray_timestamp?: string;
  system_state: string;
}

export interface PestSpecies {
  id: string;
  name: string;
  scientificName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  optimalTempRange: string;
  optimalHumidityRange: string;
  symptoms: string;
  recommendedRemedy: string;
}
