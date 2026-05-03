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
    console.error('Token verification error:', error);
    return { authenticated: false, error: error.message };
  }
}

// Generate JWT token
export function generateToken(userId, email, role, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { userId, email, role },
    secret,
    { expiresIn }
  );
}

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}