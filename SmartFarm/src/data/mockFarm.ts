import type { Farm, Greenhouse, DeviceInfo, FarmProfile } from '../types/farm';

export const mockFarm: Farm = {
  id: 'farm-001',
  name: 'Green Valley Farm',
  location: 'Western Province, Sri Lanka',
  totalArea: '0.8 ha',
};

export const mockGreenhouse: Greenhouse = {
  id: 'gh-001',
  farmId: 'farm-001',
  name: 'Tomato Greenhouse A',
  crop: 'Tomato',
  growthStage: 'Flowering',
  zoneId: 'tomato-zone-a',
  area: '200 m²',
};

export const mockDevice: DeviceInfo = {
  id: 'esp32-node-01',
  name: 'ESP32 Edge Node 01',
  zone: 'Tomato Zone A',
  status: 'demo',
  inferenceMode: 'Edge AI concept',
  lastUpdate: 'Demo mode — no live connection',
};

export const mockFarmProfile: FarmProfile = {
  farm: mockFarm,
  greenhouse: mockGreenhouse,
  device: mockDevice,
};
