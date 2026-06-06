import { scheduleRepository } from '../repositories/scheduleRepository';
import { deviceRepository } from '../repositories/deviceRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function parseDays(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error();
    return arr;
  } catch {
    return [];
  }
}

async function assertDeviceOwner(deviceId: number, userId: number) {
  const device = await deviceRepository.findById(deviceId);
  if (!device) throw new NotFoundError('Device');
  if (device.room.apartment.ownerId !== userId) throw new UnauthorizedError('Access denied');
  return device;
}

async function assertScheduleOwner(scheduleId: number, userId: number) {
  const schedule = await scheduleRepository.findById(scheduleId);
  if (!schedule) throw new NotFoundError('Schedule');
  const device = await deviceRepository.findById(schedule.deviceId);
  if (!device) throw new NotFoundError('Device');
  if (device.room.apartment.ownerId !== userId) throw new UnauthorizedError('Access denied');
  return schedule;
}

export const scheduleService = {
  async listForDevice(deviceId: number, userId: number) {
    await assertDeviceOwner(deviceId, userId);
    const schedules = await scheduleRepository.findAllByDevice(deviceId);
    return schedules.map((s) => ({ ...s, days: parseDays(s.days) }));
  },

  async create(
    data: { deviceId: number; startTime: string; endTime: string; days: string[] },
    userId: number,
  ) {
    await assertDeviceOwner(data.deviceId, userId);
    const invalidDays = data.days.filter((d) => !VALID_DAYS.includes(d));
    if (invalidDays.length) throw new Error(`Invalid days: ${invalidDays.join(', ')}`);
    const created = await scheduleRepository.create({
      ...data,
      days: JSON.stringify(data.days),
    });
    return { ...created, days: data.days };
  },

  async update(
    id: number,
    data: { startTime?: string; endTime?: string; days?: string[]; active?: boolean },
    userId: number,
  ) {
    await assertScheduleOwner(id, userId);
    const updateData: { startTime?: string; endTime?: string; days?: string; active?: boolean } = {
      startTime: data.startTime,
      endTime: data.endTime,
      active: data.active,
    };
    if (data.days) {
      const invalidDays = data.days.filter((d) => !VALID_DAYS.includes(d));
      if (invalidDays.length) throw new Error(`Invalid days: ${invalidDays.join(', ')}`);
      updateData.days = JSON.stringify(data.days);
    }
    const updated = await scheduleRepository.update(id, updateData);
    return { ...updated, days: parseDays(updated.days) };
  },

  async remove(id: number, userId: number) {
    await assertScheduleOwner(id, userId);
    await scheduleRepository.remove(id);
  },
};
