import bcrypt from 'bcrypt';
import { prisma } from '../src/db/prisma';
import { specFor } from '../src/utils/deviceFactory';

async function main() {
  console.log('[seed] starting...');

  await prisma.energyData.deleteMany();
  await prisma.device.deleteMany();
  await prisma.room.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@smartbuilding.test',
      passwordHash,
      name: 'Demo Resident',
      role: 'RESIDENT',
    },
  });
  console.log('[seed] user created:', user.email);

  const building = await prisma.building.create({
    data: { name: 'Sarajevo Lights Building A', location: 'Sarajevo, Bosnia and Herzegovina' },
  });

  const apartment = await prisma.apartment.create({
    data: {
      number: 'A-101',
      area: 72.5,
      buildingId: building.id,
      ownerId: user.id,
    },
  });
  console.log('[seed] apartment created:', apartment.number);

  const roomDefs = [
    { name: 'Living Room', type: 'LIVING_ROOM' },
    { name: 'Kitchen', type: 'KITCHEN' },
    { name: 'Bedroom', type: 'BEDROOM' },
    { name: 'Bathroom', type: 'BATHROOM' },
  ];

  const rooms = await Promise.all(
    roomDefs.map((r) => prisma.room.create({ data: { ...r, apartmentId: apartment.id } })),
  );

  const deviceDefs: { name: string; type: string; roomIndex: number; status: boolean }[] = [
    { name: 'Ceiling Light', type: 'LIGHT', roomIndex: 0, status: true },
    { name: 'TV', type: 'TV', roomIndex: 0, status: true },
    { name: 'AC Unit', type: 'AC', roomIndex: 0, status: false },
    { name: 'Kitchen Light', type: 'LIGHT', roomIndex: 1, status: false },
    { name: 'Refrigerator Outlet', type: 'OUTLET', roomIndex: 1, status: true },
    { name: 'Bedside Lamp', type: 'LIGHT', roomIndex: 2, status: false },
    { name: 'Bedroom Thermostat', type: 'THERMOSTAT', roomIndex: 2, status: true },
    { name: 'Bathroom Light', type: 'LIGHT', roomIndex: 3, status: false },
    { name: 'Washing Machine', type: 'WASHING_MACHINE', roomIndex: 3, status: false },
  ];

  const devices = [];
  for (const d of deviceDefs) {
    const spec = specFor(d.type);
    const created = await prisma.device.create({
      data: {
        name: d.name,
        type: d.type,
        powerWatts: spec.defaultPowerWatts,
        roomId: rooms[d.roomIndex].id,
        status: d.status,
      },
    });
    devices.push(created);
  }
  console.log(`[seed] created ${devices.length} devices`);

  const now = new Date();
  const readings: { deviceId: number; valueKwh: number; timestamp: Date }[] = [];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    for (let hour = 0; hour < 24; hour++) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - dayOffset);
      ts.setHours(hour, 0, 0, 0);
      if (ts > now) continue;

      for (const device of devices) {
        const spec = specFor(device.type);
        const activeProb = device.type === 'OUTLET' ? 1 : device.type === 'LIGHT' ? 0.3 : 0.5;
        const isActive = Math.random() < activeProb;
        if (!isActive) continue;
        const kwh = (spec.defaultPowerWatts * spec.loadFactor) / 1000;
        const noisy = kwh * (0.7 + Math.random() * 0.6);
        readings.push({
          deviceId: device.id,
          valueKwh: Number(noisy.toFixed(4)),
          timestamp: ts,
        });
      }
    }
  }

  await prisma.energyData.createMany({ data: readings });
  console.log(`[seed] inserted ${readings.length} energy readings`);

  console.log('[seed] done.');
  console.log('\n=================================');
  console.log('Login credentials:');
  console.log('  Email:    demo@smartbuilding.test');
  console.log('  Password: demo1234');
  console.log('=================================\n');
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
