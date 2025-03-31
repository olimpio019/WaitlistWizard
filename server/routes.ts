import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertSubmissionSchema,
  fichaCadastralFiadorPFSchema,
  fichaCadastralLocatariaPJSchema,
  cadastroImovelSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get stats for dashboard
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getSubmissionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter estatísticas', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Get all submissions
  app.get('/api/submissions', async (req: Request, res: Response) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter cadastros', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Get a specific submission
  app.get('/api/submissions/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: 'Cadastro não encontrado' });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter cadastro', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Create a new submission
  app.post('/api/submissions', upload.single('arquivo'), async (req: Request, res: Response) => {
    try {
      const { tipoFormulario, ...formData } = req.body;
      
      // Validate form data based on form type
      let validatedData;
      
      if (tipoFormulario === 'ficha-fiador-pf') {
        validatedData = fichaCadastralFiadorPFSchema.parse(JSON.parse(formData.formData));
      } else if (tipoFormulario === 'ficha-locataria-pj') {
        validatedData = fichaCadastralLocatariaPJSchema.parse(JSON.parse(formData.formData));
      } else if (tipoFormulario === 'cadastro-imovel') {
        validatedData = cadastroImovelSchema.parse(JSON.parse(formData.formData));
      } else {
        return res.status(400).json({ message: 'Tipo de formulário inválido' });
      }
      
      // Create submission data
      const submissionData = {
        nome: validatedData.nome || validatedData.razaoSocial || validatedData.nomeProprietario,
        cpf: validatedData.cpf || validatedData.cnpj || validatedData.cpfCnpjProprietario,
        email: validatedData.email || validatedData.emailProprietario,
        celular: validatedData.celular || validatedData.telefoneProprietario,
        codigoImovel: validatedData.codigoImovel,
        tipoFormulario,
        formData: JSON.stringify(validatedData),
        assinatura: validatedData.assinatura,
        arquivoPdf: req.file ? req.file.filename : undefined,
        dataCadastro: new Date()
      };
      
      // Validate with submission schema
      const parsedSubmission = insertSubmissionSchema.parse(submissionData);
      
      // Create the submission
      const newSubmission = await storage.createSubmission(parsedSubmission);
      
      res.status(201).json(newSubmission);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao criar cadastro', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Update a submission
  app.put('/api/submissions/:id', upload.single('arquivo'), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const existingSubmission = await storage.getSubmission(id);
      if (!existingSubmission) {
        return res.status(404).json({ message: 'Cadastro não encontrado' });
      }
      
      const { tipoFormulario, ...formData } = req.body;
      
      // Validate form data based on form type
      let validatedData;
      
      if (tipoFormulario === 'ficha-fiador-pf') {
        validatedData = fichaCadastralFiadorPFSchema.parse(JSON.parse(formData.formData));
      } else if (tipoFormulario === 'ficha-locataria-pj') {
        validatedData = fichaCadastralLocatariaPJSchema.parse(JSON.parse(formData.formData));
      } else if (tipoFormulario === 'cadastro-imovel') {
        validatedData = cadastroImovelSchema.parse(JSON.parse(formData.formData));
      } else {
        return res.status(400).json({ message: 'Tipo de formulário inválido' });
      }
      
      // Update submission data
      const submissionData = {
        nome: validatedData.nome || validatedData.razaoSocial || validatedData.nomeProprietario,
        cpf: validatedData.cpf || validatedData.cnpj || validatedData.cpfCnpjProprietario,
        email: validatedData.email || validatedData.emailProprietario,
        celular: validatedData.celular || validatedData.telefoneProprietario,
        codigoImovel: validatedData.codigoImovel,
        tipoFormulario,
        formData: JSON.stringify(validatedData),
        assinatura: validatedData.assinatura,
      };
      
      // Add file if uploaded
      if (req.file) {
        submissionData.arquivoPdf = req.file.filename;
      }
      
      // Update the submission
      const updatedSubmission = await storage.updateSubmission(id, submissionData);
      
      res.json(updatedSubmission);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao atualizar cadastro', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Delete a submission
  app.delete('/api/submissions/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: 'Cadastro não encontrado' });
      }
      
      // Delete associated file if exists
      if (submission.arquivoPdf) {
        const filePath = path.join(process.cwd(), 'uploads', submission.arquivoPdf);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteSubmission(id);
      
      res.json({ message: 'Cadastro excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao excluir cadastro', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // API endpoint to download a generated PDF based on the submission data
  app.get('/api/submissions/:id/pdf', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: 'Cadastro não encontrado' });
      }
      
      // If there's a stored PDF file, send it
      if (submission.arquivoPdf) {
        const filePath = path.join(process.cwd(), 'uploads', submission.arquivoPdf);
        if (fs.existsSync(filePath)) {
          return res.download(filePath);
        }
      }
      
      // If no file exists, indicate that PDF needs to be generated first
      res.status(404).json({ message: 'PDF não encontrado. Gere o PDF primeiro.' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao baixar PDF', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
