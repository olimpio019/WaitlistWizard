import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';
import { isAdmin } from '@shared/middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Usa o middleware de admin
    await isAdmin(req, res, async () => {
      // Busca todos os usuários
      const users = await storage.getAllUsers();
      
      // Não envie as senhas ao cliente
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(usersWithoutPasswords);
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ 
      message: 'Erro ao buscar usuários', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
} 