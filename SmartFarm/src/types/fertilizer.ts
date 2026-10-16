// Fertilizer management types

export type TaskStatus = 'pending' | 'completed';

export interface FertilizerReminder {
  id: string;
  title: string;
  date: string;         // Display date string e.g. "20 Oct"
  dateISO: string;      // ISO date for sorting
  status: TaskStatus;
  isDemo?: boolean;     // true = pre-seeded demonstration task
}

export interface NutrientReading {
  label: string;
  value: string;        // e.g. "Not connected"
  available: boolean;
}

export interface FertilizerStatus {
  crop: string;
  growthStage: string;
  lastNpkReading: string;
  nitrogen: NutrientReading;
  phosphorus: NutrientReading;
  potassium: NutrientReading;
}
