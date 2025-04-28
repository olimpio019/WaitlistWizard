import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getTokenFromRequest } from './auth';
import { storage } from '../server/storage';

export async function isAuthenticated(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
  
  // Adiciona o usuário decodificado à requisição
  (req as any).user = decoded;
  
  next();
}

export async function isAdmin(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
  
  if (!decoded.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado. É necessário privilégios de administrador.' });
  }
  
  // Adiciona o usuário decodificado à requisição
  (req as any).user = decoded;
  
  next();
} 