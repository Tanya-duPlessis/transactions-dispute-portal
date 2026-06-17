import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';
import type { JwtPayload } from '../types';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

const SALT_ROUNDS = 12;

const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as string,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as string,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('EMAIL_TAKEN', 'An account with this email already exists', 409);
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const tokens = generateTokens(payload);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const tokens = generateTokens(payload);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  },

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
      const user = await userRepository.findById(payload.userId);
      if (!user) throw new AppError('INVALID_TOKEN', 'User not found', 401);
      const newPayload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
      const tokens = generateTokens(newPayload);
      return tokens;
    } catch {
      throw new AppError('INVALID_TOKEN', 'Invalid or expired refresh token', 401);
    }
  },
};
