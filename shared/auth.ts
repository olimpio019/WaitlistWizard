import jwt from 'jsonwebtoken';
import { User } from './schema';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido no ambiente');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = '24h';

export function generateToken(user: User) {
  const { password, ...userWithoutPassword } = user;
  return jwt.sign(
    { 
      userId: user.id,
      isAdmin: user.isAdmin,
      ...userWithoutPassword 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      isAdmin: boolean;
      [key: string]: any;
    };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: { headers: { authorization?: string } }) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) return null;
  
  return token;
} 