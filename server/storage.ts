import { submissions, users, type Submission, type InsertSubmission, type User, type InsertUser } from "@shared/schema";
import bcrypt from "bcryptjs";

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

export class MemStorage implements IStorage {
  private submissions: Map<number, Submission>;
  private users: Map<number, User>;
  private currentSubmissionId: number;
  private currentUserId: number;

  constructor() {
    this.submissions = new Map();
    this.users = new Map();
    this.currentSubmissionId = 1;
    this.currentUserId = 1;
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: bcrypt.hashSync("admin123", 10),
      nome: "Administrador",
      email: "admin@example.com",
      isAdmin: true
    });
  }

  // SUBMISSION METHODS
  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const now = new Date();
    
    const newSubmission: Submission = {
      ...submission,
      id,
      dataCadastro: submission.dataCadastro || now,
      assinatura: submission.assinatura || null,
      arquivoPdf: submission.arquivoPdf || null
    };
    
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  async updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const existingSubmission = this.submissions.get(id);
    
    if (!existingSubmission) {
      return undefined;
    }
    
    const updatedSubmission: Submission = {
      ...existingSubmission,
      ...submission,
      assinatura: submission.assinatura !== undefined ? submission.assinatura : existingSubmission.assinatura,
      arquivoPdf: submission.arquivoPdf !== undefined ? submission.arquivoPdf : existingSubmission.arquivoPdf
    };
    
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async deleteSubmission(id: number): Promise<boolean> {
    return this.submissions.delete(id);
  }

  async getSubmissionsByType(type: string): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.tipoFormulario === type)
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
  }

  async getSubmissionStats(): Promise<{ 
    totalCadastros: number; 
    imoveisDisponiveis: number; 
    contratosPendentes: number; 
    documentosPendentes: number; 
  }> {
    const allSubmissions = Array.from(this.submissions.values());
    const imoveis = allSubmissions.filter(s => s.tipoFormulario === 'cadastro-imovel');
    
    // For this example, we'll use simple logic to determine status
    // In a real app, this would be based on actual status fields
    return {
      totalCadastros: allSubmissions.length,
      imoveisDisponiveis: imoveis.length,
      contratosPendentes: Math.floor(allSubmissions.length * 0.1), // 10% of submissions for demo
      documentosPendentes: Math.floor(allSubmissions.length * 0.15), // 15% of submissions for demo
    };
  }
  
  // USER METHODS
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Hash the password if it's not already hashed
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
    
    const newUser: User = {
      ...user,
      id,
      isAdmin: user.isAdmin ?? false,
      dataCriacao: user.dataCriacao || now
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    // Hash the password if it has been changed and is not already hashed
    if (userData.password && 
        !userData.password.startsWith('$2a$') && 
        !userData.password.startsWith('$2b$') && 
        !userData.password.startsWith('$2y$')) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
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
}

export const storage = new MemStorage();
