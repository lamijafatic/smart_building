import { prisma } from '../db/prisma';

const DAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

async function applySchedules(): Promise<void> {
  const now = new Date();
  const currentDay = DAY_MAP[now.getDay()];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  const schedules = await prisma.schedule.findMany({ where: { active: true } });
  if (schedules.length === 0) return;

  // group by device
  const byDevice = new Map<number, typeof schedules>();
  for (const s of schedules) {
    if (!byDevice.has(s.deviceId)) byDevice.set(s.deviceId, []);
    byDevice.get(s.deviceId)!.push(s);
  }

  // for each device that has schedules, determine ON or OFF
  const updates: Promise<unknown>[] = [];
  for (const [deviceId, devSchedules] of byDevice) {
    const shouldBeOn = devSchedules.some((s) => {
      let days: string[];
      try { days = JSON.parse(s.days); } catch { return false; }
      if (!days.includes(currentDay)) return false;
      return currentTime >= s.startTime && currentTime < s.endTime;
    });
    updates.push(
      prisma.device.update({ where: { id: deviceId }, data: { status: shouldBeOn } })
    );
  }
  await Promise.all(updates);
  console.log(`[scheduler] applied ${byDevice.size} device schedule(s) at ${currentTime}`);
}

export function startScheduleExecutor(): void {
  console.log('[scheduler] starting — checking schedules every 60s');
  // Run immediately, then every 60 seconds
  applySchedules().catch((e) => console.error('[scheduler] error:', e));
  setInterval(() => {
    applySchedules().catch((e) => console.error('[scheduler] error:', e));
  }, 60_000);
}
