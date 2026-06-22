jest.mock('../../src/repositories/user.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

import { authService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../src/middleware/errorHandler';

const mockUser = {
  id: 'user-1',
  email: 'test@demo.com',
  name: 'Test User',
  passwordHash: 'hashed-password',
  role: 'CUSTOMER' as import('@prisma/client').Role,
  createdAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_ACCESS_EXPIRY = '15m';
  process.env.JWT_REFRESH_EXPIRY = '7d';
});

describe('authService.login', () => {
  it('returns user and tokens on valid credentials', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');

    const result = await authService.login({
      email: 'test@demo.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@demo.com');
    expect(result.accessToken).toBe('mock-token');
  });

  it('throws INVALID_CREDENTIALS when user not found', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login({ email: 'unknown@demo.com', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('throws INVALID_CREDENTIALS when password is wrong', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({ email: 'test@demo.com', password: 'wrong-password' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

describe('authService.register', () => {
  it('throws EMAIL_TAKEN when email already exists', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: 'test@demo.com',
        password: 'password123',
        name: 'Test User',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  it('creates user and returns tokens on valid registration', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');

    const result = await authService.register({
      email: 'new@demo.com',
      password: 'password123',
      name: 'New User',
    });

    expect(result.user.email).toBe('test@demo.com');
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });
});
