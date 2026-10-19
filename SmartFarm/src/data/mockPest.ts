import { PestDashboardData, PestSpecies, SprayEvent } from '../types/pest';

export const mockPestDashboard: PestDashboardData = {
  latest_prediction: 'Low_Infestation',
  temperature: 27.4,
  humidity: 68.2,
  anomaly_score: 0.08,
  is_anomaly_alert: false,
  last_telemetry_timestamp: 'Just now',
  is_spray_lockout_active: false,
  lockout_remaining_hours: 0.0,
  last_spray_timestamp: '3 days ago',
  system_state: 'MONITORING (Normal Baseline)',
};

export const mockPestSpecies: PestSpecies[] = [
  {
    id: 'pest-1',
    name: 'Tomato Fruitworm',
    scientificName: 'Helicoverpa zea',
    riskLevel: 'moderate',
    optimalTempRange: '24°C - 32°C',
    optimalHumidityRange: '60% - 80%',
    symptoms: 'Deep entry boreholes in green tomatoes, causing internal decay and premature drop.',
    recommendedRemedy: 'Apply Bacillus thuringiensis (Bt) or Spinosad bio-spray in late afternoon.',
  },
  {
    id: 'pest-2',
    name: 'Tomato Leafminer',
    scientificName: 'Tuta absoluta',
    riskLevel: 'low',
    optimalTempRange: '22°C - 30°C',
    optimalHumidityRange: '65% - 85%',
    symptoms: 'Silvery serpentine leaf mines; larval tunneling inside stems and apical buds.',
    recommendedRemedy: 'Install yellow pheromone traps; spray Neem Azal 1% bio-extract.',
  },
  {
    id: 'pest-3',
    name: 'Silverleaf Whitefly',
    scientificName: 'Bemisia tabaci',
    riskLevel: 'low',
    optimalTempRange: '26°C - 34°C',
    optimalHumidityRange: '50% - 75%',
    symptoms: 'Sticky honeydew secretions, sooty mold growth, vectors Tomato Yellow Leaf Curl Virus.',
    recommendedRemedy: 'Introduce predatory Encarsia formosa wasps or insecticidal potassium soap spray.',
  },
  {
    id: 'pest-4',
    name: 'Green Peach Aphid',
    scientificName: 'Myzus persicae',
    riskLevel: 'low',
    optimalTempRange: '18°C - 26°C',
    optimalHumidityRange: '55% - 75%',
    symptoms: 'Leaf puckering, distorted apical shoots, sap loss from underside of foliage.',
    recommendedRemedy: 'Spray horticultural mineral oil or diluted cold-pressed Neem seed oil.',
  },
];

export const mockSprayHistory: SprayEvent[] = [
  {
    id: 'SPRAY-01',
    timestamp: 'Today, 08:30 AM',
    notes: 'Preventative biological Neem oil foliar application (Zone-A1)',
    lockout_active: true,
    lockout_hours_remaining: 18.5,
  },
  {
    id: 'SPRAY-02',
    timestamp: '5 days ago',
    notes: 'Bacillus thuringiensis kurstaki biological application',
    lockout_active: false,
    lockout_hours_remaining: 0.0,
  },
];
