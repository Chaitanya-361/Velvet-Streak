import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';

function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth',
  });
}

// POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password, displayName } = req.body;

    if (store.findUserByEmail(email)) {
      throw new AppError('CONFLICT', 409, 'Email already registered');
    }
    if (store.findUserByUsername(username)) {
      throw new AppError('CONFLICT', 409, 'Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const now = new Date().toISOString();
    const user = {
      _id: uuid(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      passwordHash,
      displayName: displayName || username,
      bio: '',
      xp: 0,
      level: 1,
      badgesEarned: [],
      preferences: {
        timezone: 'UTC',
        dayBoundaryTime: '03:00',
        weekStartDay: 'MON' as const,
        theme: 'dark' as const,
      },
      refreshTokens: [],
      isEmailVerified: true, // auto-verified for dev
      emailVerifyToken: null,
      emailVerifyExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      deletionRequestedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    store.users.push(user);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token hash
    const tokenHash = await bcrypt.hash(refreshToken, 4);
    user.refreshTokens.push({
      tokenHash,
      device: req.headers['user-agent'] || 'unknown',
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = store.findUserByEmail(email);
    if (!user) {
      throw new AppError('UNAUTHORIZED', 401, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('UNAUTHORIZED', 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const tokenHash = await bcrypt.hash(refreshToken, 4);
    user.refreshTokens.push({
      tokenHash,
      device: req.headers['user-agent'] || 'unknown',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Cleanup expired tokens
    const now = Date.now();
    user.refreshTokens = user.refreshTokens.filter(t => new Date(t.expiresAt).getTime() > now);

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError('UNAUTHORIZED', 401, 'No refresh token');
    }

    let decoded: { sub: string };
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new AppError('UNAUTHORIZED', 401, 'Invalid or expired refresh token');
    }

    const user = store.findUserById(decoded.sub);
    if (!user) {
      throw new AppError('UNAUTHORIZED', 401, 'User not found');
    }

    // Validate token exists in stored tokens
    let matchIdx = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const valid = await bcrypt.compare(token, user.refreshTokens[i].tokenHash);
      if (valid) { matchIdx = i; break; }
    }
    if (matchIdx === -1) {
      throw new AppError('UNAUTHORIZED', 401, 'Refresh token revoked');
    }

    // Rotate: remove old, issue new
    user.refreshTokens.splice(matchIdx, 1);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const newTokenHash = await bcrypt.hash(newRefreshToken, 4);
    user.refreshTokens.push({
      tokenHash: newTokenHash,
      device: req.headers['user-agent'] || 'unknown',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      const user = store.findUserById(req.user._id);
      if (user) {
        // Remove matching token
        for (let i = user.refreshTokens.length - 1; i >= 0; i--) {
          const valid = await bcrypt.compare(token, user.refreshTokens[i].tokenHash);
          if (valid) { user.refreshTokens.splice(i, 1); break; }
        }
      }
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = store.findUserById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

function sanitizeUser(user: any) {
  const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = user;
  return safe;
}
