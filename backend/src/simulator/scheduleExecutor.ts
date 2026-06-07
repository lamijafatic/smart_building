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

  const byDevice = new Map<number, typeof schedules>();
  for (const s of schedules) {
    if (!byDevice.has(s.deviceId)) byDevice.set(s.deviceId, []);
    byDevice.get(s.deviceId)!.push(s);
  }

  const updates: Promise<unknown>[] = [];
  for (const [deviceId, devSchedules] of byDevice) {
    const shouldBeOn = devSchedules.some((s) => {
      let days: string[];
      try { days = JSON.parse(s.days); } catch { return false; }
      if (!days.includes(currentDay)) return false;
      return currentTime >= s.startTime && currentTime < s.endTime;
    });
    updates.push(
      prisma.device.update({ where: { id: deviceId }, data: { status: shouldBeOn } }),
    );
  }

  await Promise.all(updates);
  if (updates.length > 0) {
    console.log(`[scheduler] applied ${updates.length} device schedule(s) at ${currentTime}`);
  }
}

export function startScheduleExecutor(): void {
  applySchedules().catch((e) => console.error('[scheduler] error:', e));
  setInterval(() => applySchedules().catch((e) => console.error('[scheduler] error:', e)), 60_000);
}
