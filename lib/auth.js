import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Verify JWT token from request
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { authenticated: false, error: 'No token provided' };
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return { authenticated: false, error: 'Invalid token format' };
    }
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not set');
      return { authenticated: false, error: 'JWT_SECRET not configured' };
    }
    
    const decoded = jwt.verify(token, secret);
    return {
      authenticated: true,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Token verification error:', error.message);
    return { authenticated: false, error: error.message };
  }
}

// Generate JWT token
export function generateToken(userId, email, role, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId, email, role }, secret, { expiresIn });
}

// Hash password
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}