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
  
  // Métodos para gráficos e relatórios
  getSubmissionTypeCounts(): Promise<{ name: string; value: number }[]>;
  getMonthlyActivity(): Promise<{ name: string; cadastros: number }[]>;
  getFinancialData(): Promise<{ mes: string; receita: number; despesa: number }[]>;
  getOccupationData(): Promise<{ mes: string; taxa: number }[]>;
  
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
  
  // Novos métodos para dados de gráficos
  
  async getSubmissionTypeCounts(): Promise<{ name: string; value: number }[]> {
    // Obter cadastros agrupados por tipo
    const result = await db
      .select({
        name: submissions.tipoFormulario,
        value: sql<number>`count(*)`
      })
      .from(submissions)
      .groupBy(submissions.tipoFormulario);
    
    // Mapeando nomes para versões mais amigáveis
    return result.map(item => ({
      name: item.name === 'ficha-fiador-pf' 
        ? 'Fiador PF' 
        : item.name === 'ficha-locataria-pj' 
        ? 'Locatária PJ' 
        : 'Imóvel',
      value: Number(item.value)
    }));
  }
  
  async getMonthlyActivity(): Promise<{ name: string; cadastros: number }[]> {
    // Em um caso real, usaríamos consultas de data para agrupar por mês
    // Como precisamos de dados reais, vamos usar as entradas que já temos no banco
    
    // Primeiro, obter todos os cadastros com suas datas
    const allSubmissions = await db
      .select({
        id: submissions.id,
        dataCadastro: submissions.dataCadastro
      })
      .from(submissions)
      .orderBy(submissions.dataCadastro);
    
    // Criar um mapa com meses dos últimos 30 dias
    const today = new Date();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyData: Record<string, number> = {};
    
    // Inicializar com os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${monthNames[d.getMonth()]}`;
      monthlyData[monthKey] = 0;
    }
    
    // Contar cadastros por mês
    allSubmissions.forEach(sub => {
      const date = new Date(sub.dataCadastro);
      const monthKey = `${monthNames[date.getMonth()]}`;
      
      // Só contar se for dos últimos 6 meses
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });
    
    // Converter para o formato esperado
    return Object.entries(monthlyData).map(([name, cadastros]) => ({
      name,
      cadastros
    }));
  }
  
  async getFinancialData(): Promise<{ mes: string; receita: number; despesa: number }[]> {
    // Em um sistema real, esses dados viriam de uma tabela financeira
    // Como exemplo, vamos gerar dados proporcionais aos cadastros
    
    const monthlyActivity = await this.getMonthlyActivity();
    
    // Converter para dados financeiros (receitas ~3000 por cadastro, despesas ~60% da receita)
    return monthlyActivity.map(({ name, cadastros }) => ({
      mes: name,
      receita: cadastros * 3000 + Math.floor(Math.random() * 1000), // Alguma variação
      despesa: Math.floor((cadastros * 3000 * 0.6) + Math.floor(Math.random() * 500))
    }));
  }
  
  async getOccupationData(): Promise<{ mes: string; taxa: number }[]> {
    // Em um sistema real, esses dados viriam de uma tabela de ocupação
    // Como exemplo, vamos gerar taxas de ocupação baseadas no número de imóveis e meses
    
    const monthlyActivity = await this.getMonthlyActivity();
    
    // Base rate starts at 70% with some variance per month
    let baseRate = 70;
    
    return monthlyActivity.map(({ name }) => {
      // Adjust base rate slightly each month (up or down by up to 5%)
      baseRate = Math.min(95, Math.max(60, baseRate + (Math.random() * 10 - 5)));
      
      return {
        mes: name,
        taxa: Math.round(baseRate)
      };
    });
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
        password: bcrypt.hashSync("Lanza@admin1214", 10),
        nome: "Administrador",
        email: "admin@lanzaimoveis.com.br",
        isAdmin: true
      });
      console.log('Admin user created successfully.');
    } else {
      // Atualiza o usuário admin existente com as novas credenciais
      await this.updateUser(adminUser.id, {
        username: "admin",
        password: "Lanza@admin1214",
        email: "admin@lanzaimoveis.com.br"
      });
      console.log('Admin user credentials updated.');
    }
  }
}

// Inicializamos o banco de dados com um armazenamento PostgreSQL
export const storage = new DatabaseStorage();
