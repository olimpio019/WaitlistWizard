import { submissions, users, type Submission, type InsertSubmission, type User, type InsertUser } from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Submissions
  getAllSubmissions(): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined>;
  deleteSubmission(id: number): Promise<boolean>;
  getSubmissionsByType(type: string): Promise<Submission[]>;
  getSubmissionStats(): Promise<{ 
    totalCadastros: number; 
    imoveisDisponiveis: number; 
    contratosPendentes: number; 
    documentosPendentes: number; 
  }>;
  
  // Users
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  validateUser(username: string, password: string): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  // SUBMISSION METHODS
  async getAllSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.dataCadastro));
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const result = await db.select().from(submissions).where(eq(submissions.id, id));
    return result[0];
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const now = new Date();
    const submissionWithDefaults = {
      ...submission,
      dataCadastro: submission.dataCadastro || now,
      assinatura: submission.assinatura || null,
      arquivoPdf: submission.arquivoPdf || null
    };
    
    const [newSubmission] = await db.insert(submissions)
      .values(submissionWithDefaults)
      .returning();
    
    return newSubmission;
  }

  async updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const existingSubmission = await this.getSubmission(id);
    
    if (!existingSubmission) {
      return undefined;
    }
    
    // Preparar o objeto de atualização mantendo valores existentes se não fornecidos
    const updateData = {
      ...submission,
      assinatura: submission.assinatura !== undefined ? submission.assinatura : existingSubmission.assinatura,
      arquivoPdf: submission.arquivoPdf !== undefined ? submission.arquivoPdf : existingSubmission.arquivoPdf
    };
    
    const [updatedSubmission] = await db.update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    
    return updatedSubmission;
  }

  async deleteSubmission(id: number): Promise<boolean> {
    const result = await db.delete(submissions).where(eq(submissions.id, id)).returning({ id: submissions.id });
    return result.length > 0;
  }

  async getSubmissionsByType(type: string): Promise<Submission[]> {
    return db.select()
      .from(submissions)
      .where(eq(submissions.tipoFormulario, type))
      .orderBy(desc(submissions.dataCadastro));
  }

  async getSubmissionStats(): Promise<{ 
    totalCadastros: number; 
    imoveisDisponiveis: number; 
    contratosPendentes: number; 
    documentosPendentes: number; 
  }> {
    // Obter contagem total de cadastros
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(submissions);
    const totalCadastros = totalResult?.count || 0;
    
    // Obter imóveis disponíveis (tipo cadastro-imovel)
    const [imoveisResult] = await db.select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.tipoFormulario, 'cadastro-imovel'));
    const imoveisDisponiveis = imoveisResult?.count || 0;
    
    // Para este exemplo, calcularemos contratos e documentos pendentes como percentuais do total
    // Em um aplicativo real, isso seria baseado em campos de status reais
    const contratosPendentes = Math.floor(totalCadastros * 0.1); // 10% dos cadastros
    const documentosPendentes = Math.floor(totalCadastros * 0.15); // 15% dos cadastros
    
    return {
      totalCadastros,
      imoveisDisponiveis,
      contratosPendentes,
      documentosPendentes
    };
  }
  
  // USER METHODS
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.nome);
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const now = new Date();
    
    // Hash the password if it's not already hashed
    let password = user.password;
    if (!password.startsWith('$2a$') && !password.startsWith('$2b$') && !password.startsWith('$2y$')) {
      password = bcrypt.hashSync(password, 10);
    }
    
    const userData = {
      ...user,
      password,
      isAdmin: user.isAdmin ?? false,
      dataCriacao: user.dataCriacao || now
    };
    
    const [newUser] = await db.insert(users)
      .values(userData)
      .returning();
    
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUserById(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    // Preparar dados para atualização
    const updateData = { ...userData };
    
    // Hash the password if it has been changed and is not already hashed
    if (updateData.password && 
        !updateData.password.startsWith('$2a$') && 
        !updateData.password.startsWith('$2b$') && 
        !updateData.password.startsWith('$2y$')) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }
    
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }

  // Método para verificar se já existe um usuário admin e criar um se não existir
  async initializeAdminUser(): Promise<void> {
    const adminUser = await this.getUserByUsername('admin');
    
    if (!adminUser) {
      await this.createUser({
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        nome: "Administrador",
        email: "admin@example.com",
        isAdmin: true
      });
      console.log('Admin user created successfully.');
    }
  }
}

// Inicializamos o banco de dados com um armazenamento PostgreSQL
export const storage = new DatabaseStorage();
