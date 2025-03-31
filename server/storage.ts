import { submissions, type Submission, type InsertSubmission } from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private submissions: Map<number, Submission>;
  private currentId: number;

  constructor() {
    this.submissions = new Map();
    this.currentId = 1;
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.currentId++;
    const now = new Date();
    
    const newSubmission: Submission = {
      ...submission,
      id,
      dataCadastro: submission.dataCadastro || now
    };
    
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  async updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const existingSubmission = this.submissions.get(id);
    
    if (!existingSubmission) {
      return undefined;
    }
    
    const updatedSubmission = {
      ...existingSubmission,
      ...submission
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
}

export const storage = new MemStorage();
