import { NextApiRequest, NextApiResponse } from 'next';
import { loginSchema } from '@shared/schema';
import { storage } from '../../server/storage';
import bcrypt from 'bcryptjs';
import { fromZodError } from 'zod-validation-error';
import { generateToken } from '@shared/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Valida os dados de login
    const loginData = loginSchema.parse(req.body);
    
    // Busca o usuário pelo username
    const user = await storage.getUserByUsername(loginData.username);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
    
    // Verifica a senha
    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
    
    // Não envie a senha de volta ao cliente
    const { password, ...userWithoutPassword } = user;
    
    // Gera o token JWT
    const token = generateToken(user);
    
    // Define o cookie com o token
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}`);
    
    return res.json({ 
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: 'Dados de login inválidos', 
        errors: validationError.details 
      });
    }
    
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ 
      message: 'Erro ao realizar login', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
} 