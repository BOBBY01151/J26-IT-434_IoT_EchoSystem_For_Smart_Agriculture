// Farm and greenhouse types

export interface Farm {
  id: string;
  name: string;
  location: string;
  totalArea: string;
}

export interface Greenhouse {
  id: string;
  farmId: string;
  name: string;
  crop: string;
  growthStage: GrowthStage;
  zoneId: string;
  area: string;
}

export type GrowthStage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Ripening' | 'Harvest';

export type CropGrowthStageKey =
  | 'seed'
  | 'small_plants'
  | 'big_plants'
  | 'flowering'
  | 'fruit_setting'
  | 'harvest';

export interface CropDetailsRecord {
  greenhouseName: string;
  cropName: string;
  plantingDate: string; // YYYY-MM-DD
  seedsPlanted: number;
  soilFungicideApplied: boolean;
  cropAgeDays: number;
  cropAgeFormatted: string;
  estimatedStage: CropGrowthStageKey;
  actualStage: CropGrowthStageKey;
  lastUpdated: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  zone: string;
  status: 'demo' | 'online' | 'offline';
  inferenceMode: string;
  lastUpdate: string;
}

export interface FarmProfile {
  farm: Farm;
  greenhouse: Greenhouse;
  device: DeviceInfo;
}
