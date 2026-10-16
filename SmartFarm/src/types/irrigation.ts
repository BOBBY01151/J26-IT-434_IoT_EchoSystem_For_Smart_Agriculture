// Irrigation-related types

export interface IrrigationSummary {
  predictedVolume: number;   // Litres
  deliveredVolume: number;   // Litres (simulated)
  dailyTotal: number;        // Litres
  pumpStatus: 'idle' | 'running' | 'disabled';
}

export interface IrrigationEvent {
  id: string;
  timestamp: string;
  volume: number;       // Litres
  duration: number;     // Minutes
  trigger: 'scheduled' | 'manual' | 'model';
  note: string;
}

export interface ModelInfo {
  modelType: string;
  executionConcept: string;
  inputCount: number;
  currentStatus: string;
}
