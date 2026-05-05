import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { signToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new UnauthorizedError('Email already in use');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, name });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
};
