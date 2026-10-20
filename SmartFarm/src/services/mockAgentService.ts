

export interface LiveSensorState {
  soilMoisture: number;          // %
  airTemperature: number;        // °C
  relativeHumidity: number;      // %
  vpd: number;                   // kPa (Vapor Pressure Deficit)
  solarRadiation: number;        // W/m²
  evapotranspiration: number;    // mm/day
  atmosphericPressure: number;   // hPa
}

export interface AgentIrrigationState {
  isAutoMode: boolean;           // True = AI Closed Loop, False = Manual Mode
  pumpStatus: 'idle' | 'running' | 'disabled';
  predictedVolume: number;       // Litres output by DNN model
  deliveredToday: number;        // Total litres delivered today
  hasAnomaly: boolean;           // K-Means model output
  anomalyScore: number;          // Distance score
  lastDecisionReason: string;
}

export interface AgentEventLog {
  id: string;
  timestamp: string;
  volume: number;
  duration: number;              // minutes or seconds
  trigger: 'agent' | 'manual' | 'scheduled';
  note: string;
}

// Initial baseline state
export const initialSensorState: LiveSensorState = {
  soilMoisture: 38.5,
  airTemperature: 26.8,
  relativeHumidity: 64.0,
  vpd: 1.15,
  solarRadiation: 650,
  evapotranspiration: 4.1,
  atmosphericPressure: 1012.4,
};

// Initial agent state
export const initialAgentState: AgentIrrigationState = {
  isAutoMode: true,
  pumpStatus: 'idle',
  predictedVolume: 2.4,
  deliveredToday: 6.8,
  hasAnomaly: false,
  anomalyScore: 0.08,
  lastDecisionReason: 'Agent active: Monitoring microclimate and root-zone moisture.',
};

/**
 * Calculates Vapor Pressure Deficit (VPD in kPa) using the Tetens equation
 */
export function calculateVPD(tempC: number, rhPct: number): number {
  const svp = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const avp = svp * (rhPct / 100);
  return +(Math.max(0, svp - avp)).toFixed(2);
}

/**
 * Simulates a single tick of microclimate fluctuation
 */
export function tickSensors(prev: LiveSensorState): LiveSensorState {
  const newTemp = +(prev.airTemperature + (Math.random() * 0.2 - 0.1)).toFixed(1);
  const newRh = +(Math.min(95, Math.max(30, prev.relativeHumidity + (Math.random() * 0.6 - 0.3)))).toFixed(1);
  const newMoisture = +(Math.max(10, prev.soilMoisture - 0.05)).toFixed(1); // Gradual natural drying
  const newSolar = Math.round(Math.max(0, prev.solarRadiation + (Math.random() * 8 - 4)));
  const newEt = +(prev.evapotranspiration + (Math.random() * 0.04 - 0.02)).toFixed(1);
  const newPressure = +(prev.atmosphericPressure + (Math.random() * 0.1 - 0.05)).toFixed(1);
  const newVpd = calculateVPD(newTemp, newRh);

  return {
    soilMoisture: newMoisture,
    airTemperature: newTemp,
    relativeHumidity: newRh,
    vpd: newVpd,
    solarRadiation: newSolar,
    evapotranspiration: newEt,
    atmosphericPressure: newPressure,
  };
}

/**
 * Evaluates whether the Closed-Loop Agent needs to automatically irrigate
 */
export function evaluateAgentClosedLoop(
  sensors: LiveSensorState,
  agent: AgentIrrigationState
): { shouldIrrigate: boolean; predictedDose: number; reason: string } {
  // If anomaly detected by K-Means, safety lock activates
  if (agent.hasAnomaly) {
    return {
      shouldIrrigate: false,
      predictedDose: 0.0,
      reason: 'Safety Lock: K-Means anomaly detected in sensor stream. Pump locked.',
    };
  }

  // Dry soil threshold for tomato vegetative phase: < 40% moisture
  if (sensors.soilMoisture < 40.0) {
    // DNN water demand prediction based on deficit and ET
    const deficit = (60.0 - sensors.soilMoisture) / 100.0;
    const dose = +(1.5 + deficit * 2.5 + sensors.evapotranspiration * 0.2).toFixed(1);
    return {
      shouldIrrigate: true,
      predictedDose: dose,
      reason: `Soil moisture (${sensors.soilMoisture}%) below 40% threshold. Closed-loop agent triggered ${dose}L dose.`,
    };
  }

  return {
    shouldIrrigate: false,
    predictedDose: +(Math.max(0.8, sensors.evapotranspiration * 0.4)).toFixed(1),
    reason: `Soil moisture (${sensors.soilMoisture}%) is optimal. Holding irrigation cycle.`,
  };
}
