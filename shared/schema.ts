import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Common schemas
export const addressSchema = z.object({
  cep: z.string().min(1, "CEP é obrigatório"),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
});

export const contactSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  celular: z.string().min(1, "Celular é obrigatório"),
  telefone: z.string().optional(),
});

// Base submission schema containing common fields for all form types
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull(),
  email: text("email").notNull(),
  celular: text("celular").notNull(),
  codigoImovel: text("codigo_imovel").notNull(),
  dataCadastro: timestamp("data_cadastro").defaultNow().notNull(),
  tipoFormulario: text("tipo_formulario").notNull(), // Identifies which form was submitted
  formData: text("form_data").notNull(), // JSON string of all form data
  assinatura: text("assinatura"), // Base64 data URL of signature
  arquivoPdf: text("arquivo_pdf"), // Filename or path to stored PDF
});

// Schema for FichaCadastralFiadorPF
export const fichaCadastralFiadorPFSchema = z.object({
  // Personal data
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  rg: z.string().min(1, "RG é obrigatório"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  
  // Contact information
  ...contactSchema.shape,
  
  // Address
  ...addressSchema.shape,
  
  // Property information
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  valorAluguel: z.string().min(1, "Valor do aluguel é obrigatório"),
  prazoContrato: z.string().min(1, "Prazo do contrato é obrigatório"),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema for FichaCadastralLocatariaPJ
export const fichaCadastralLocatariaPJSchema = z.object({
  // Company data
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().min(1, "Nome fantasia é obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  inscricaoEstadual: z.string().optional(),
  dataFundacao: z.string().min(1, "Data de fundação é obrigatória"),
  ramoAtividade: z.string().min(1, "Ramo de atividade é obrigatório"),
  
  // Legal representative
  representanteLegal: z.string().min(1, "Nome do representante legal é obrigatório"),
  cpfRepresentante: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  cargoRepresentante: z.string().min(1, "Cargo do representante é obrigatório"),
  
  // Contact information
  ...contactSchema.shape,
  
  // Address
  ...addressSchema.shape,
  
  // Property information
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  valorAluguel: z.string().min(1, "Valor do aluguel é obrigatório"),
  prazoContrato: z.string().min(1, "Prazo do contrato é obrigatório"),
  finalidadeLocacao: z.string().min(1, "Finalidade da locação é obrigatória"),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema for CadastroImovel
export const cadastroImovelSchema = z.object({
  // Property identification
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  tipoImovel: z.string().min(1, "Tipo do imóvel é obrigatório"),
  finalidade: z.string().min(1, "Finalidade é obrigatória"),
  valorAluguel: z.string().min(1, "Valor do aluguel é obrigatório"),
  valorVenda: z.string().optional(),
  areaTotal: z.string().min(1, "Área total é obrigatória"),
  areaConstruida: z.string().min(1, "Área construída é obrigatória"),
  
  // Features
  quartos: z.string().min(1, "Número de quartos é obrigatório"),
  banheiros: z.string().min(1, "Número de banheiros é obrigatório"),
  suites: z.string().optional(),
  vagasGaragem: z.string().min(1, "Número de vagas de garagem é obrigatório"),
  
  // Property address
  ...addressSchema.shape,
  
  // Owner information
  nomeProprietario: z.string().min(1, "Nome do proprietário é obrigatório"),
  cpfCnpjProprietario: z.string().min(1, "CPF/CNPJ do proprietário é obrigatório"),
  telefoneProprietario: z.string().min(1, "Telefone do proprietário é obrigatório"),
  emailProprietario: z.string().email("E-mail inválido").min(1, "E-mail do proprietário é obrigatório"),
  
  // Additional info
  descricao: z.string().optional(),
  caracteristicas: z.string().optional(),
  observacoes: z.string().optional(),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Base submission schema for database operations
export const insertSubmissionSchema = createInsertSchema(submissions);

// Users schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull(),
});

// User schema for validation
export const userSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  isAdmin: z.boolean().optional(),
});

// Login schema for validation
export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Base user schema for database operations
export const insertUserSchema = createInsertSchema(users);

// Schema para Ficha Cadastral Locatário PF
export const fichaCadastralLocatarioPFSchema = z.object({
  // Personal information
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  rg: z.string().min(1, "RG é obrigatório"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  
  // Financial information
  rendaMensal: z.string().min(1, "Renda mensal é obrigatória"),
  localTrabalho: z.string().min(1, "Local de trabalho é obrigatório"),
  tempoTrabalho: z.string().min(1, "Tempo de trabalho é obrigatório"),
  
  // Contact information
  ...contactSchema.shape,
  
  // Address
  ...addressSchema.shape,
  
  // Property information
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  valorAluguel: z.string().min(1, "Valor do aluguel é obrigatório"),
  prazoContrato: z.string().min(1, "Prazo do contrato é obrigatório"),
  finalidadeLocacao: z.string().min(1, "Finalidade da locação é obrigatória"),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema para Modelo de Proposta de Compra
export const propostaCompraSchema = z.object({
  // Buyer information
  nomeComprador: z.string().min(1, "Nome do comprador é obrigatório"),
  cpfComprador: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  ...contactSchema.shape,
  
  // Property information
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  enderecoImovel: z.string().min(1, "Endereço do imóvel é obrigatório"),
  
  // Offer details
  valorProposta: z.string().min(1, "Valor da proposta é obrigatório"),
  condicaoPagamento: z.string().min(1, "Condição de pagamento é obrigatória"),
  valorEntrada: z.string().min(1, "Valor de entrada é obrigatório"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  dataValidade: z.string().min(1, "Data de validade da proposta é obrigatória"),
  
  // Additional information
  observacoes: z.string().optional(),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema para Proposta para Locação de Imóvel
export const propostaLocacaoSchema = z.object({
  // Tenant information
  nomeLocatario: z.string().min(1, "Nome do locatário é obrigatório"),
  cpfLocatario: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  ...contactSchema.shape,
  
  // Property information
  codigoImovel: z.string().min(1, "Código do imóvel é obrigatório"),
  enderecoImovel: z.string().min(1, "Endereço do imóvel é obrigatório"),
  
  // Offer details
  valorAluguelProposto: z.string().min(1, "Valor do aluguel proposto é obrigatório"),
  prazoDuracao: z.string().min(1, "Prazo de duração é obrigatório"),
  dataInicioDesejada: z.string().min(1, "Data de início desejada é obrigatória"),
  garantiaAluguel: z.string().min(1, "Garantia de aluguel é obrigatória"),
  
  // Additional information
  condicoesEspeciais: z.string().optional(),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema para Autorização Lanza Imóveis
export const autorizacaoImoveisSchema = z.object({
  // Owner information
  nomeProprietario: z.string().min(1, "Nome do proprietário é obrigatório"),
  cpfCnpjProprietario: z.string().min(1, "CPF/CNPJ é obrigatório"),
  emailProprietario: z.string().email("E-mail inválido"),
  telefoneProprietario: z.string().min(1, "Telefone é obrigatório"),
  
  // Property information
  enderecoImovel: z.string().min(1, "Endereço do imóvel é obrigatório"),
  tipoImovel: z.string().min(1, "Tipo do imóvel é obrigatório"),
  areaImovel: z.string().min(1, "Área do imóvel é obrigatória"),
  
  // Authorization details
  tipoAutorizacao: z.string().min(1, "Tipo de autorização é obrigatório"),
  valorDesejado: z.string().min(1, "Valor desejado é obrigatório"),
  prazoAutorizacao: z.string().min(1, "Prazo da autorização é obrigatório"),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema para Autorização com Foto - Venda
export const autorizacaoFotoVendaSchema = z.object({
  // Owner information
  nomeProprietario: z.string().min(1, "Nome do proprietário é obrigatório"),
  cpfCnpjProprietario: z.string().min(1, "CPF/CNPJ é obrigatório"),
  ...contactSchema.shape,
  
  // Property information
  enderecoImovel: z.string().min(1, "Endereço do imóvel é obrigatório"),
  tipoImovel: z.string().min(1, "Tipo do imóvel é obrigatório"),
  areaImovel: z.string().min(1, "Área do imóvel é obrigatória"),
  
  // Authorization details
  valorVenda: z.string().min(1, "Valor de venda é obrigatório"),
  prazoAutorizacao: z.string().min(1, "Prazo da autorização é obrigatório"),
  autorizaFotos: z.boolean(),
  autorizaVisitas: z.boolean(),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Schema para Autorização com Foto - Locação
export const autorizacaoFotoLocacaoSchema = z.object({
  // Owner information
  nomeProprietario: z.string().min(1, "Nome do proprietário é obrigatório"),
  cpfCnpjProprietario: z.string().min(1, "CPF/CNPJ é obrigatório"),
  ...contactSchema.shape,
  
  // Property information
  enderecoImovel: z.string().min(1, "Endereço do imóvel é obrigatório"),
  tipoImovel: z.string().min(1, "Tipo do imóvel é obrigatório"),
  areaImovel: z.string().min(1, "Área do imóvel é obrigatória"),
  
  // Authorization details
  valorAluguel: z.string().min(1, "Valor do aluguel é obrigatório"),
  prazoAutorizacao: z.string().min(1, "Prazo da autorização é obrigatório"),
  autorizaFotos: z.boolean(),
  autorizaVisitas: z.boolean(),
  
  // Terms and signature
  terms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos e condições",
  }),
  assinatura: z.string().optional(),
});

// Type definitions
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type FichaCadastralFiadorPF = z.infer<typeof fichaCadastralFiadorPFSchema>;
export type FichaCadastralLocatariaPJ = z.infer<typeof fichaCadastralLocatariaPJSchema>;
export type CadastroImovel = z.infer<typeof cadastroImovelSchema>;
export type FichaCadastralLocatarioPF = z.infer<typeof fichaCadastralLocatarioPFSchema>;
export type PropostaCompra = z.infer<typeof propostaCompraSchema>;
export type PropostaLocacao = z.infer<typeof propostaLocacaoSchema>;
export type AutorizacaoImoveis = z.infer<typeof autorizacaoImoveisSchema>;
export type AutorizacaoFotoVenda = z.infer<typeof autorizacaoFotoVendaSchema>;
export type AutorizacaoFotoLocacao = z.infer<typeof autorizacaoFotoLocacaoSchema>;
