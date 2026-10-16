import type { IrrigationSummary, IrrigationEvent, ModelInfo } from '../types/irrigation';

// Simulated irrigation summary — not from a real pump or sensor
export const mockIrrigationSummary: IrrigationSummary = {
  predictedVolume: 1.8,
  deliveredVolume: 1.76,
  dailyTotal: 12.6,
  pumpStatus: 'idle',
};

export const mockModelInfo: ModelInfo = {
  modelType: 'TinyML irrigation prediction',
  executionConcept: 'ESP32 edge inference',
  inputCount: 7,
  currentStatus: 'Demo only — no inference running',
};

// Demonstration irrigation history events — fictional timestamps
export const mockIrrigationHistory: IrrigationEvent[] = [
  {
    id: 'evt-001',
    timestamp: '16 Oct · 08:00',
    volume: 1.76,
    duration: 4,
    trigger: 'model',
    note: 'Morning micro-dose (demo)',
  },
  {
    id: 'evt-002',
    timestamp: '16 Oct · 06:30',
    volume: 2.1,
    duration: 5,
    trigger: 'scheduled',
    note: 'Pre-dawn scheduled (demo)',
  },
  {
    id: 'evt-003',
    timestamp: '15 Oct · 14:00',
    volume: 1.9,
    duration: 4,
    trigger: 'model',
    note: 'Afternoon micro-dose (demo)',
  },
  {
    id: 'evt-004',
    timestamp: '15 Oct · 08:00',
    volume: 1.85,
    duration: 4,
    trigger: 'model',
    note: 'Morning micro-dose (demo)',
  },
  {
    id: 'evt-005',
    timestamp: '15 Oct · 06:30',
    volume: 2.05,
    duration: 5,
    trigger: 'scheduled',
    note: 'Pre-dawn scheduled (demo)',
  },
  {
    id: 'evt-006',
    timestamp: '14 Oct · 14:00',
    volume: 2.0,
    duration: 5,
    trigger: 'model',
    note: 'Afternoon micro-dose (demo)',
  },
];
