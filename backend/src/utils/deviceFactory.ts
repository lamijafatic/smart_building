export type DeviceType =
  | 'LIGHT'
  | 'THERMOSTAT'
  | 'OUTLET'
  | 'AC'
  | 'TV'
  | 'WASHING_MACHINE'
  | 'OTHER';

interface DeviceSpec {
  defaultPowerWatts: number;
  loadFactor: number;
}

const DEVICE_SPECS: Record<DeviceType, DeviceSpec> = {
  LIGHT: { defaultPowerWatts: 12, loadFactor: 1 },
  THERMOSTAT: { defaultPowerWatts: 1500, loadFactor: 0.5 },
  OUTLET: { defaultPowerWatts: 100, loadFactor: 0.6 },
  AC: { defaultPowerWatts: 2000, loadFactor: 0.7 },
  TV: { defaultPowerWatts: 90, loadFactor: 0.95 },
  WASHING_MACHINE: { defaultPowerWatts: 1800, loadFactor: 0.8 },
  OTHER: { defaultPowerWatts: 50, loadFactor: 0.5 },
};

export function specFor(type: string): DeviceSpec {
  const key = (type as DeviceType) in DEVICE_SPECS ? (type as DeviceType) : 'OTHER';
  return DEVICE_SPECS[key];
}

export function buildDevice(input: { name: string; type: DeviceType; roomId: number }) {
  const spec = specFor(input.type);
  return {
    name: input.name,
    type: input.type,
    powerWatts: spec.defaultPowerWatts,
    roomId: input.roomId,
    status: false,
  };
}
