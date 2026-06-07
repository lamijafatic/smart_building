import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { signToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError } from '../utils/errors';

function safeUser(u: { id: number; email: string; name: string; role: string; hasConnected: boolean }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, hasConnected: u.hasConnected };
}

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already in use');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, name });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { token, user: safeUser(user) };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedError('Invalid email or password');
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { token, user: safeUser(user) };
  },

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return safeUser(user);
  },

  async connect(userId: number) {
    await userRepository.markConnected(userId);
  },
};
