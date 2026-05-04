import { prisma } from '../db/prisma';
import { specFor } from '../utils/deviceFactory';

const TICK_SECONDS = 15;
const TICK_MS = TICK_SECONDS * 1000;

async function fillGaps(): Promise<void> {
  const onDevices = await prisma.device.findMany({ where: { status: true } });
  if (onDevices.length === 0) return;

  const now = new Date();
  const readings: { deviceId: number; valueKwh: number; timestamp: Date }[] = [];

  for (const device of onDevices) {
    const last = await prisma.energyData.findFirst({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
    });

    if (!last) continue;

    const gapMs = now.getTime() - last.timestamp.getTime();
    const gapSeconds = gapMs / 1000;

    if (gapSeconds < TICK_SECONDS * 2) continue;

    const spec = specFor(device.type);
    const powerW = device.powerWatts ?? spec.defaultPowerWatts;
    const gapKwh = (powerW * spec.loadFactor * gapSeconds) / 3_600_000;

    readings.push({
      deviceId: device.id,
      valueKwh: Number(gapKwh.toFixed(6)),
      timestamp: now,
    });

    console.log(
      `[simulator] gap-fill: device ${device.id} "${device.name}" — ` +
        `${Math.round(gapSeconds / 60)} min offline → +${gapKwh.toFixed(4)} kWh`,
    );
  }

  if (readings.length > 0) {
    await prisma.energyData.createMany({ data: readings });
    console.log(`[simulator] gap-fill: inserted ${readings.length} catch-up readings`);
  }
}

async function tick(): Promise<void> {
  const onDevices = await prisma.device.findMany({ where: { status: true } });
  if (onDevices.length === 0) return;

  const now = new Date();
  const readings = onDevices.map((d) => {
    const spec = specFor(d.type);
    const powerW = d.powerWatts ?? spec.defaultPowerWatts;
    const baseKwh = (powerW * spec.loadFactor * TICK_SECONDS) / 3_600_000;
    const noisy = baseKwh * (0.85 + Math.random() * 0.3);
    return {
      deviceId: d.id,
      valueKwh: Number(noisy.toFixed(6)),
      timestamp: now,
    };
  });

  await prisma.energyData.createMany({ data: readings });
  console.log(
    `[simulator] tick: ${readings.length} device(s) @ ${now.toTimeString().slice(0, 8)}`,
  );
}

export async function startSimulator(): Promise<void> {
  console.log(`[simulator] starting — tick every ${TICK_SECONDS}s`);

  try {
    await fillGaps();
  } catch (e) {
    console.error('[simulator] gap-fill error (non-fatal):', e);
  }

  try {
    await tick();
  } catch (e) {
    console.error('[simulator] first tick error (non-fatal):', e);
  }

  setInterval(() => {
    tick().catch((e) => console.error('[simulator] tick error:', e));
  }, TICK_MS);
}
