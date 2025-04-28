import { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '@shared/middleware';
import { generateUploadUrl } from '@shared/s3';
import { z } from 'zod';

const generateUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Usa o middleware de autenticação
    await isAuthenticated(req, res, async () => {
      // Valida os dados da requisição
      const { fileName, contentType } = generateUrlSchema.parse(req.body);
      
      // Gera uma chave única para o arquivo
      const key = `uploads/${Date.now()}-${fileName}`;
      
      // Gera a URL de upload
      const uploadUrl = await generateUploadUrl(key, contentType);
      
      return res.json({ 
        uploadUrl,
        key
      });
    });
    
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error);
    return res.status(500).json({ 
      message: 'Erro ao gerar URL de upload', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
} 