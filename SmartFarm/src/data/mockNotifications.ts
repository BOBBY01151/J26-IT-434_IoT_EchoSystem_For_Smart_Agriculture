import type { AppNotification } from '../types/notification';

// Static demonstration notifications — no push infrastructure
export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    title: 'Sensor readings available',
    body: 'Latest environmental readings have been loaded for Tomato Greenhouse A. Review the dashboard for details.',
    timestamp: '2 min ago',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-002',
    title: 'Fertilizer schedule reminder',
    body: 'Upcoming task: Review nutrient requirements — scheduled for 18 Oct.',
    timestamp: '1 hour ago',
    type: 'warning',
    read: false,
  },
  {
    id: 'notif-003',
    title: 'Plant image inspection due',
    body: 'A weekly plant-health image inspection is recommended. Open Plant Health to capture an image.',
    timestamp: '3 hours ago',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-004',
    title: 'Demo device status',
    body: 'ESP32 Edge Node 01 is running in demonstration mode. Hardware integration is not active in this prototype.',
    timestamp: 'Yesterday',
    type: 'device',
    read: true,
  },
  {
    id: 'notif-005',
    title: 'Irrigation event logged',
    body: 'A demonstration irrigation event of 1.76 L was simulated for Tomato Zone A at 08:00.',
    timestamp: 'Yesterday',
    type: 'success',
    read: true,
  },
];
