import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import passport from "passport";
import {
  insertSubmissionSchema,
  fichaCadastralFiadorPFSchema,
  fichaCadastralLocatariaPJSchema,
  cadastroImovelSchema,
  loginSchema,
  userSchema,
  insertUserSchema
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

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Não autorizado. Faça login primeiro.' });
};

// Middleware para verificar se o usuário é admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Acesso negado. É necessário privilégios de administrador.' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar diretório de uploads como estático para acessar arquivos
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Rotas de autenticação
  app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida os dados de login
      const loginData = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: info.message || 'Usuário ou senha inválidos' });
        }
        
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Não envie a senha de volta ao cliente
          const { password, ...userWithoutPassword } = user;
          return res.json({ 
            message: 'Login realizado com sucesso',
            user: userWithoutPassword
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Dados de login inválidos', 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao realizar login', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
  
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json({ 
        authenticated: true,
        user: userWithoutPassword
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // CRUD de usuários (protegido por admin)
  app.get('/api/users', isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Não envie as senhas ao cliente
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter usuários', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  app.post('/api/users', isAdmin, async (req: Request, res: Response) => {
    try {
      // Valida os dados do usuário
      const userData = userSchema.parse(req.body);
      
      // Verifica se o username já existe
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Nome de usuário já existe' });
      }
      
      // Cria o usuário
      const newUser = await storage.createUser(userData);
      
      // Não envie a senha de volta ao cliente
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Dados de usuário inválidos', 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao criar usuário', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  app.put('/api/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      // Verifica se o usuário existe
      const existingUser = await storage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Valida os dados do usuário (partial)
      const userData = userSchema.partial().parse(req.body);
      
      // Se o username estiver sendo alterado, verifica se já existe
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await storage.getUserByUsername(userData.username);
        if (usernameExists) {
          return res.status(400).json({ message: 'Nome de usuário já existe' });
        }
      }
      
      // Atualiza o usuário
      const updatedUser = await storage.updateUser(id, userData);
      
      // Não envie a senha de volta ao cliente
      const { password, ...userWithoutPassword } = updatedUser!;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Dados de usuário inválidos', 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao atualizar usuário', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  app.delete('/api/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      // Não permite excluir o próprio usuário
      if (req.user && (req.user as any).id === id) {
        return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' });
      }
      
      // Verifica se o usuário existe
      const existingUser = await storage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Exclui o usuário
      await storage.deleteUser(id);
      
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao excluir usuário', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  // ROTAS PROTEGIDAS - Requer autenticação
  // Adicione isAuthenticated ou isAdmin como middleware para proteger as rotas
  
  // Get stats for dashboard
  app.get('/api/stats', isAuthenticated, async (req: Request, res: Response) => {
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
  
  // Get submissions by type for pie chart
  app.get('/api/stats/by-type', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await storage.getSubmissionTypeCounts();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter estatísticas por tipo', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  // Get monthly activity data for bar chart
  app.get('/api/stats/monthly-activity', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await storage.getMonthlyActivity();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter atividade mensal', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  // Get financial data for chart
  app.get('/api/stats/financial', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await storage.getFinancialData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter dados financeiros', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });
  
  // Get occupation rate data for chart
  app.get('/api/stats/occupation', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await storage.getOccupationData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erro ao obter dados de ocupação', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  });

  // Get all submissions
  app.get('/api/submissions', isAuthenticated, async (req: Request, res: Response) => {
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
  app.get('/api/submissions/:id', isAuthenticated, async (req: Request, res: Response) => {
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

  // Create a new submission - acesso público para envio de formulários
  app.post('/api/submissions', upload.single('arquivo'), async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        return res.status(400).json({ message: 'Dados do formulário não fornecidos' });
      }
      
      const { tipoFormulario, ...formData } = req.body;
      
      if (!tipoFormulario) {
        return res.status(400).json({ message: 'Tipo de formulário não especificado' });
      }
      
      if (!formData.formData) {
        return res.status(400).json({ message: 'Dados do formulário não fornecidos' });
      }
      
      // Validate form data based on form type
      let validatedData;
      try {
        if (tipoFormulario === 'ficha-fiador-pf') {
          validatedData = fichaCadastralFiadorPFSchema.parse(JSON.parse(formData.formData));
        } else if (tipoFormulario === 'ficha-locataria-pj') {
          validatedData = fichaCadastralLocatariaPJSchema.parse(JSON.parse(formData.formData));
        } else if (tipoFormulario === 'cadastro-imovel') {
          validatedData = cadastroImovelSchema.parse(JSON.parse(formData.formData));
        } else {
          return res.status(400).json({ message: 'Tipo de formulário inválido' });
        }
      } catch (parseError) {
        console.error('Erro ao processar dados do formulário:', parseError);
        return res.status(400).json({ 
          message: 'Erro ao processar dados do formulário', 
          error: parseError instanceof Error ? parseError.message : 'Erro desconhecido' 
        });
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
  app.put('/api/submissions/:id', upload.single('arquivo'), isAdmin, async (req: Request, res: Response) => {
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
  app.delete('/api/submissions/:id', isAdmin, async (req: Request, res: Response) => {
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
  app.get('/api/submissions/:id/pdf', isAuthenticated, async (req: Request, res: Response) => {
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
