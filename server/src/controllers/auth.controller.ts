import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError, AuthRequest } from '../types';

function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET as jwt.Secret, { expiresIn: env.JWT_ACCESS_EXPIRY as any });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET as jwt.Secret, { expiresIn: env.JWT_REFRESH_EXPIRY as any });
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

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      throw new AppError('CONFLICT', 409, 'Email already registered');
    }
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      throw new AppError('CONFLICT', 409, 'Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const now = new Date().toISOString();
    
    const user = new User({
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
        weekStartDay: 'MON',
        theme: 'dark',
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
    });

    const refreshToken = generateRefreshToken(user._id.toString());
    const tokenHash = await bcrypt.hash(refreshToken, 4);
    
    user.refreshTokens.push({
      tokenHash,
      device: req.headers['user-agent'] || 'unknown',
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user.toObject()),
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('UNAUTHORIZED', 401, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('UNAUTHORIZED', 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

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

    await user.save();
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user.toObject()),
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

    const user = await User.findById(decoded.sub);
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

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    const newTokenHash = await bcrypt.hash(newRefreshToken, 4);
    user.refreshTokens.push({
      tokenHash: newTokenHash,
      device: req.headers['user-agent'] || 'unknown',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await user.save();
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
      const user = await User.findById(req.user._id);
      if (user) {
        // Remove matching token
        for (let i = user.refreshTokens.length - 1; i >= 0; i--) {
          const valid = await bcrypt.compare(token, user.refreshTokens[i].tokenHash);
          if (valid) { user.refreshTokens.splice(i, 1); break; }
        }
        await user.save();
      }
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    res.json({ success: true, data: sanitizeUser(user.toObject()) });
  } catch (err) {
    next(err);
  }
}

function sanitizeUser(user: any) {
  const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = user;
  if (safe._id) safe._id = safe._id.toString();
  return safe;
}
