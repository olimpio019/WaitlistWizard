import { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '@shared/middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Usa o middleware de autenticação
    await isAuthenticated(req, res, () => {
      const user = (req as any).user;
      return res.json({ 
        authenticated: true,
        user
      });
    });
    
  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error);
    return res.status(500).json({ 
      message: 'Erro ao verificar status de autenticação', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
} 