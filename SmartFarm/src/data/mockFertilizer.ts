import type { FertilizerReminder, FertilizerStatus } from '../types/fertilizer';

// Nutrient sensor is not physically installed — all readings unavailable
export const mockFertilizerStatus: FertilizerStatus = {
  crop: 'Tomato',
  growthStage: 'Flowering',
  lastNpkReading: 'Not available',
  nitrogen: {
    label: 'Nitrogen (N)',
    value: 'Not connected',
    available: false,
  },
  phosphorus: {
    label: 'Phosphorus (P)',
    value: 'Not connected',
    available: false,
  },
  potassium: {
    label: 'Potassium (K)',
    value: 'Not connected',
    available: false,
  },
};

// Pre-seeded demonstration reminders — not agronomic recommendations
export const mockFertilizerReminders: FertilizerReminder[] = [
  {
    id: 'rem-001',
    title: 'Review nutrient requirements',
    date: '18 Oct',
    dateISO: '2026-10-18',
    status: 'pending',
    isDemo: true,
  },
  {
    id: 'rem-002',
    title: 'Inspect plant growth',
    date: '20 Oct',
    dateISO: '2026-10-20',
    status: 'pending',
    isDemo: true,
  },
  {
    id: 'rem-003',
    title: 'Review fertilizer schedule',
    date: '23 Oct',
    dateISO: '2026-10-23',
    status: 'pending',
    isDemo: true,
  },
];
