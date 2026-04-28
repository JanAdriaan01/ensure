import jwt from 'jsonwebtoken';

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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
export function generateToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Hash password (wrapper for bcrypt)
export async function hashPassword(password) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hash) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

// Middleware to protect API routes
export function withAuth(handler, options = {}) {
  return async (request, context) => {
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check role if required
    if (options.roles && !options.roles.includes(auth.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Add user to request context
    request.user = auth;
    return handler(request, context);
  };
}