import { jsPDF } from "jspdf";
import { 
  FichaCadastralFiadorPF, 
  FichaCadastralLocatariaPJ, 
  CadastroImovel, 
  FichaCadastralLocatarioPF, 
  PropostaCompra, 
  PropostaLocacao, 
  AutorizacaoImoveis, 
  AutorizacaoFotoVenda, 
  AutorizacaoFotoLocacao 
} from "@shared/schema";
import { formatCPF, formatCNPJ, formatPhone, formatDate, formatCEP } from "@/lib/utils";
import logo from "@/assets/logo.png";

// Helper function to add multiline text
const addMultiLineText = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number
): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * 7); // Return the new Y position
};

// Função para adicionar o logo no cabeçalho dos PDFs
const addLogoHeader = (doc: jsPDF) => {
  // Adiciona o logo no topo do documento
  const logoWidth = 40;
  const logoHeight = 14;
  
  // Converte SVG para URL base64 para uso com jsPDF
  const logoImg = new Image();
  logoImg.src = logo;
  
  // Adiciona o logo como imagem
  try {
    doc.addImage(logoImg, 'SVG', 14, 5, logoWidth, logoHeight);
  } catch (error) {
    console.error("Erro ao adicionar logo:", error);
  }
  
  return logoHeight + 10; // Retorna a altura após o logo
};

// Generate PDF for Ficha Cadastral Fiador PF
export const generateFichaCadastralFiadorPFPdf = (data: FichaCadastralFiadorPF, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("FICHA CADASTRAL - FIADOR PESSOA FÍSICA", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Personal data section
    doc.setFontSize(14);
    doc.text("Dados Pessoais", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Personal data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nome}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF: ${formatCPF(data.cpf)}`, 14, yPos);
    doc.text(`RG: ${data.rg}`, 105, yPos);
    yPos += 7;
    doc.text(`Data de Nascimento: ${formatDate(data.dataNascimento)}`, 14, yPos);
    doc.text(`Estado Civil: ${data.estadoCivil}`, 105, yPos);
    yPos += 7;
    doc.text(`Profissão: ${data.profissao}`, 14, yPos);
    
    yPos += 15;
    
    // Contact information section
    doc.setFontSize(14);
    doc.text("Contato", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Contact information content
    doc.setFontSize(10);
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Address section
    doc.setFontSize(14);
    doc.text("Endereço", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Address content
    doc.setFontSize(10);
    doc.text(`CEP: ${formatCEP(data.cep)}`, 14, yPos);
    yPos += 7;
    doc.text(`Logradouro: ${data.logradouro}`, 14, yPos);
    doc.text(`Número: ${data.numero}`, 105, yPos);
    yPos += 7;
    if (data.complemento) {
      doc.text(`Complemento: ${data.complemento}`, 14, yPos);
      yPos += 7;
    }
    doc.text(`Bairro: ${data.bairro}`, 14, yPos);
    yPos += 7;
    doc.text(`Cidade: ${data.cidade}`, 14, yPos);
    doc.text(`Estado: ${data.estado}`, 105, yPos);
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor do Aluguel: ${data.valorAluguel}`, 14, yPos);
    doc.text(`Prazo do Contrato: ${data.prazoContrato} meses`, 105, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Estou ciente de que a falsidade de qualquer informação pode resultar na recusa ou rescisão do contrato.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Ficha Cadastral Locatária PJ
export const generateFichaCadastralLocatariaPJPdf = (data: FichaCadastralLocatariaPJ, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("FICHA CADASTRAL - LOCATÁRIA PESSOA JURÍDICA", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Company data section
    doc.setFontSize(14);
    doc.text("Dados da Empresa", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Company data content
    doc.setFontSize(10);
    doc.text(`Razão Social: ${data.razaoSocial}`, 14, yPos);
    yPos += 7;
    doc.text(`Nome Fantasia: ${data.nomeFantasia}`, 14, yPos);
    yPos += 7;
    doc.text(`CNPJ: ${formatCNPJ(data.cnpj)}`, 14, yPos);
    if (data.inscricaoEstadual) {
      doc.text(`Inscrição Estadual: ${data.inscricaoEstadual}`, 105, yPos);
    }
    yPos += 7;
    doc.text(`Data de Fundação: ${formatDate(data.dataFundacao)}`, 14, yPos);
    yPos += 7;
    doc.text(`Ramo de Atividade: ${data.ramoAtividade}`, 14, yPos);
    
    yPos += 15;
    
    // Legal representative section
    doc.setFontSize(14);
    doc.text("Representante Legal", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Legal representative content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.representanteLegal}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF: ${formatCPF(data.cpfRepresentante)}`, 14, yPos);
    doc.text(`Cargo: ${data.cargoRepresentante}`, 105, yPos);
    
    yPos += 15;
    
    // Contact information section
    doc.setFontSize(14);
    doc.text("Contato", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Contact information content
    doc.setFontSize(10);
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Address section
    doc.setFontSize(14);
    doc.text("Endereço", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Address content
    doc.setFontSize(10);
    doc.text(`CEP: ${formatCEP(data.cep)}`, 14, yPos);
    yPos += 7;
    doc.text(`Logradouro: ${data.logradouro}`, 14, yPos);
    doc.text(`Número: ${data.numero}`, 105, yPos);
    yPos += 7;
    if (data.complemento) {
      doc.text(`Complemento: ${data.complemento}`, 14, yPos);
      yPos += 7;
    }
    doc.text(`Bairro: ${data.bairro}`, 14, yPos);
    yPos += 7;
    doc.text(`Cidade: ${data.cidade}`, 14, yPos);
    doc.text(`Estado: ${data.estado}`, 105, yPos);
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor do Aluguel: ${data.valorAluguel}`, 14, yPos);
    doc.text(`Prazo do Contrato: ${data.prazoContrato} meses`, 105, yPos);
    yPos += 7;
    doc.text(`Finalidade da Locação: ${data.finalidadeLocacao}`, 14, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Estou ciente de que a falsidade de qualquer informação pode resultar na recusa ou rescisão do contrato.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Cadastro Imóvel
export const generateCadastroImovelPdf = (data: CadastroImovel, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("CADASTRO DE IMÓVEL", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Property identification section
    doc.setFontSize(14);
    doc.text("Identificação do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property identification content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    doc.text(`Tipo do Imóvel: ${data.tipoImovel}`, 105, yPos);
    yPos += 7;
    doc.text(`Finalidade: ${data.finalidade}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor do Aluguel: ${data.valorAluguel}`, 14, yPos);
    if (data.valorVenda) {
      doc.text(`Valor de Venda: ${data.valorVenda}`, 105, yPos);
    }
    yPos += 7;
    doc.text(`Área Total: ${data.areaTotal} m²`, 14, yPos);
    doc.text(`Área Construída: ${data.areaConstruida} m²`, 105, yPos);
    
    yPos += 15;
    
    // Features section
    doc.setFontSize(14);
    doc.text("Características", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Features content
    doc.setFontSize(10);
    doc.text(`Quartos: ${data.quartos}`, 14, yPos);
    doc.text(`Banheiros: ${data.banheiros}`, 70, yPos);
    if (data.suites) {
      doc.text(`Suítes: ${data.suites}`, 126, yPos);
    }
    yPos += 7;
    doc.text(`Vagas de Garagem: ${data.vagasGaragem}`, 14, yPos);
    
    yPos += 15;
    
    // Property address section
    doc.setFontSize(14);
    doc.text("Endereço do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property address content
    doc.setFontSize(10);
    doc.text(`CEP: ${formatCEP(data.cep)}`, 14, yPos);
    yPos += 7;
    doc.text(`Logradouro: ${data.logradouro}`, 14, yPos);
    doc.text(`Número: ${data.numero}`, 105, yPos);
    yPos += 7;
    if (data.complemento) {
      doc.text(`Complemento: ${data.complemento}`, 14, yPos);
      yPos += 7;
    }
    doc.text(`Bairro: ${data.bairro}`, 14, yPos);
    yPos += 7;
    doc.text(`Cidade: ${data.cidade}`, 14, yPos);
    doc.text(`Estado: ${data.estado}`, 105, yPos);
    
    yPos += 15;
    
    // Owner information section
    doc.setFontSize(14);
    doc.text("Informações do Proprietário", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Owner information content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF/CNPJ: ${data.cpfCnpjProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`Telefone: ${formatPhone(data.telefoneProprietario)}`, 14, yPos);
    yPos += 7;
    doc.text(`E-mail: ${data.emailProprietario}`, 14, yPos);
    
    // Additional info section
    if (data.descricao || data.caracteristicas || data.observacoes) {
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text("Informações Adicionais", 14, yPos);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 2, 196, yPos + 2);
      
      yPos += 10;
      
      doc.setFontSize(10);
      if (data.descricao) {
        doc.text("Descrição:", 14, yPos);
        yPos += 5;
        yPos = addMultiLineText(doc, data.descricao, 14, yPos, 180);
        yPos += 5;
      }
      
      if (data.caracteristicas) {
        doc.text("Características:", 14, yPos);
        yPos += 5;
        yPos = addMultiLineText(doc, data.caracteristicas, 14, yPos, 180);
        yPos += 5;
      }
      
      if (data.observacoes) {
        doc.text("Observações:", 14, yPos);
        yPos += 5;
        yPos = addMultiLineText(doc, data.observacoes, 14, yPos, 180);
      }
    }
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Estou ciente de que a falsidade de qualquer informação pode resultar em responsabilização legal.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Ficha Cadastral Locatário PF
export const generateFichaCadastralLocatarioPFPdf = (data: FichaCadastralLocatarioPF, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("FICHA CADASTRAL - LOCATÁRIO PESSOA FÍSICA", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Personal data section
    doc.setFontSize(14);
    doc.text("Dados Pessoais", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Personal data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nome}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF: ${formatCPF(data.cpf)}`, 14, yPos);
    doc.text(`RG: ${data.rg}`, 105, yPos);
    yPos += 7;
    doc.text(`Data de Nascimento: ${formatDate(data.dataNascimento)}`, 14, yPos);
    doc.text(`Estado Civil: ${data.estadoCivil}`, 105, yPos);
    yPos += 7;
    doc.text(`Profissão: ${data.profissao}`, 14, yPos);
    doc.text(`Nacionalidade: ${data.nacionalidade}`, 105, yPos);
    
    yPos += 15;
    
    // Financial information section
    doc.setFontSize(14);
    doc.text("Informações Financeiras", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Financial information content
    doc.setFontSize(10);
    doc.text(`Renda Mensal: ${data.rendaMensal}`, 14, yPos);
    yPos += 7;
    doc.text(`Local de Trabalho: ${data.localTrabalho}`, 14, yPos);
    yPos += 7;
    doc.text(`Tempo de Trabalho: ${data.tempoTrabalho}`, 14, yPos);
    
    yPos += 15;
    
    // Contact information section
    doc.setFontSize(14);
    doc.text("Contato", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Contact information content
    doc.setFontSize(10);
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Address section
    doc.setFontSize(14);
    doc.text("Endereço", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Address content
    doc.setFontSize(10);
    doc.text(`CEP: ${formatCEP(data.cep)}`, 14, yPos);
    yPos += 7;
    doc.text(`Logradouro: ${data.logradouro}`, 14, yPos);
    doc.text(`Número: ${data.numero}`, 105, yPos);
    yPos += 7;
    if (data.complemento) {
      doc.text(`Complemento: ${data.complemento}`, 14, yPos);
      yPos += 7;
    }
    doc.text(`Bairro: ${data.bairro}`, 14, yPos);
    yPos += 7;
    doc.text(`Cidade: ${data.cidade}`, 14, yPos);
    doc.text(`Estado: ${data.estado}`, 105, yPos);
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel Pretendido", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor do Aluguel: ${data.valorAluguel}`, 14, yPos);
    doc.text(`Prazo do Contrato: ${data.prazoContrato}`, 105, yPos);
    yPos += 7;
    doc.text(`Finalidade da Locação: ${data.finalidadeLocacao}`, 14, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Estou ciente de que a falsidade de qualquer informação pode resultar na recusa ou rescisão do contrato.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Proposta de Compra
export const generatePropostaCompraPdf = (data: PropostaCompra, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("PROPOSTA DE COMPRA DE IMÓVEL", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Buyer data section
    doc.setFontSize(14);
    doc.text("Dados do Comprador", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Buyer data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeComprador}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF: ${formatCPF(data.cpfComprador)}`, 14, yPos);
    
    yPos += 15;
    
    // Contact information section
    doc.setFontSize(14);
    doc.text("Contato", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Contact information content
    doc.setFontSize(10);
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Endereço do Imóvel: ${data.enderecoImovel}`, 14, yPos);
    
    yPos += 15;
    
    // Offer details section
    doc.setFontSize(14);
    doc.text("Detalhes da Proposta", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Offer details content
    doc.setFontSize(10);
    doc.text(`Valor da Proposta: ${data.valorProposta}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor da Entrada: ${data.valorEntrada}`, 14, yPos);
    yPos += 7;
    doc.text(`Condição de Pagamento: ${data.condicaoPagamento}`, 14, yPos);
    yPos += 7;
    doc.text(`Forma de Pagamento: ${data.formaPagamento}`, 14, yPos);
    yPos += 7;
    doc.text(`Data de Validade da Proposta: ${formatDate(data.dataValidade)}`, 14, yPos);
    
    // Add observations if available
    if (data.observacoes) {
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text("Observações", 14, yPos);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 2, 196, yPos + 2);
      
      yPos += 10;
      
      doc.setFontSize(10);
      yPos = addMultiLineText(doc, data.observacoes, 14, yPos, 180);
    }
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Esta proposta está sujeita à análise e aprovação por parte do vendedor e da imobiliária. Comprometo-me a cumprir com as condições de pagamento aqui estabelecidas caso a proposta seja aceita.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Proposta de Locação
export const generatePropostaLocacaoPdf = (data: PropostaLocacao, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("PROPOSTA PARA LOCAÇÃO DE IMÓVEL", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Tenant data section
    doc.setFontSize(14);
    doc.text("Dados do Locatário", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Tenant data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeLocatario}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF: ${formatCPF(data.cpfLocatario)}`, 14, yPos);
    
    yPos += 15;
    
    // Contact information section
    doc.setFontSize(14);
    doc.text("Contato", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Contact information content
    doc.setFontSize(10);
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Código do Imóvel: ${data.codigoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Endereço do Imóvel: ${data.enderecoImovel}`, 14, yPos);
    
    yPos += 15;
    
    // Proposal details section
    doc.setFontSize(14);
    doc.text("Detalhes da Proposta", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Proposal details content
    doc.setFontSize(10);
    doc.text(`Valor do Aluguel Proposto: ${data.valorAluguelProposto}`, 14, yPos);
    yPos += 7;
    doc.text(`Prazo de Duração: ${data.prazoDuracao}`, 14, yPos);
    yPos += 7;
    doc.text(`Data de Início Desejada: ${formatDate(data.dataInicioDesejada)}`, 14, yPos);
    yPos += 7;
    doc.text(`Garantia de Aluguel: ${data.garantiaAluguel}`, 14, yPos);
    
    // Add special conditions if available
    if (data.condicoesEspeciais) {
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text("Condições Especiais", 14, yPos);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 2, 196, yPos + 2);
      
      yPos += 10;
      
      doc.setFontSize(10);
      yPos = addMultiLineText(doc, data.condicoesEspeciais, 14, yPos, 180);
    }
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que todas as informações prestadas neste formulário são verdadeiras e completas. Esta proposta está sujeita à análise e aprovação por parte do proprietário e da imobiliária. Comprometo-me a apresentar a documentação necessária caso a proposta seja aceita.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Autorização Lanza Imóveis
export const generateAutorizacaoImoveisPdf = (data: AutorizacaoImoveis, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("AUTORIZAÇÃO LANZA IMÓVEIS", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Owner data section
    doc.setFontSize(14);
    doc.text("Dados do Proprietário", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Owner data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF/CNPJ: ${data.cpfCnpjProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`E-mail: ${data.emailProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`Telefone: ${formatPhone(data.telefoneProprietario)}`, 14, yPos);
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Endereço do Imóvel: ${data.enderecoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Tipo do Imóvel: ${data.tipoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Área do Imóvel: ${data.areaImovel} m²`, 14, yPos);
    
    yPos += 15;
    
    // Authorization details section
    doc.setFontSize(14);
    doc.text("Detalhes da Autorização", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Authorization details content
    doc.setFontSize(10);
    doc.text(`Tipo de Autorização: ${data.tipoAutorizacao}`, 14, yPos);
    yPos += 7;
    doc.text(`Valor Desejado: ${data.valorDesejado}`, 14, yPos);
    yPos += 7;
    doc.text(`Prazo da Autorização: ${data.prazoAutorizacao}`, 14, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que sou proprietário(a) do imóvel descrito acima e autorizo a Lanza Imóveis a intermediar a venda e/ou locação do mesmo, de acordo com as condições estabelecidas. Esta autorização é concedida em caráter não exclusivo e poderá ser revogada a qualquer momento mediante comunicação por escrito.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Autorização com Foto - Venda
export const generateAutorizacaoFotoVendaPdf = (data: AutorizacaoFotoVenda, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("AUTORIZAÇÃO COM FOTO - VENDA", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Owner data section
    doc.setFontSize(14);
    doc.text("Dados do Proprietário", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Owner data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF/CNPJ: ${data.cpfCnpjProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Endereço do Imóvel: ${data.enderecoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Tipo do Imóvel: ${data.tipoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Área do Imóvel: ${data.areaImovel} m²`, 14, yPos);
    
    yPos += 15;
    
    // Authorization details section
    doc.setFontSize(14);
    doc.text("Detalhes da Autorização", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Authorization details content
    doc.setFontSize(10);
    doc.text(`Valor de Venda: ${data.valorVenda}`, 14, yPos);
    yPos += 7;
    doc.text(`Prazo da Autorização: ${data.prazoAutorizacao}`, 14, yPos);
    yPos += 7;
    doc.text(`Autorização para Fotos: ${data.autorizaFotos ? 'Sim' : 'Não'}`, 14, yPos);
    yPos += 7;
    doc.text(`Autorização para Visitas: ${data.autorizaVisitas ? 'Sim' : 'Não'}`, 14, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que sou proprietário(a) do imóvel descrito acima e autorizo a Lanza Imóveis a intermediar a venda do mesmo, incluindo a divulgação de fotos e informações em meios físicos e eletrônicos. Esta autorização é concedida pelo prazo especificado e poderá ser revogada mediante comunicação por escrito à imobiliária.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate PDF for Autorização com Foto - Locação
export const generateAutorizacaoFotoLocacaoPdf = (data: AutorizacaoFotoLocacao, assinatura?: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Adiciona o logo no cabeçalho
    let yPos = addLogoHeader(doc);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("AUTORIZAÇÃO COM FOTO - LOCAÇÃO", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Owner data section
    doc.setFontSize(14);
    doc.text("Dados do Proprietário", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Owner data content
    doc.setFontSize(10);
    doc.text(`Nome: ${data.nomeProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`CPF/CNPJ: ${data.cpfCnpjProprietario}`, 14, yPos);
    yPos += 7;
    doc.text(`E-mail: ${data.email}`, 14, yPos);
    yPos += 7;
    doc.text(`Celular: ${formatPhone(data.celular)}`, 14, yPos);
    if (data.telefone) {
      doc.text(`Telefone: ${formatPhone(data.telefone)}`, 105, yPos);
    }
    
    yPos += 15;
    
    // Property information section
    doc.setFontSize(14);
    doc.text("Informações do Imóvel", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Property information content
    doc.setFontSize(10);
    doc.text(`Endereço do Imóvel: ${data.enderecoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Tipo do Imóvel: ${data.tipoImovel}`, 14, yPos);
    yPos += 7;
    doc.text(`Área do Imóvel: ${data.areaImovel} m²`, 14, yPos);
    
    yPos += 15;
    
    // Authorization details section
    doc.setFontSize(14);
    doc.text("Detalhes da Autorização", 14, yPos);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    
    // Authorization details content
    doc.setFontSize(10);
    doc.text(`Valor do Aluguel: ${data.valorAluguel}`, 14, yPos);
    yPos += 7;
    doc.text(`Prazo da Autorização: ${data.prazoAutorizacao}`, 14, yPos);
    yPos += 7;
    doc.text(`Autorização para Fotos: ${data.autorizaFotos ? 'Sim' : 'Não'}`, 14, yPos);
    yPos += 7;
    doc.text(`Autorização para Visitas: ${data.autorizaVisitas ? 'Sim' : 'Não'}`, 14, yPos);
    
    yPos += 20;
    
    // Terms and signature
    doc.setFontSize(10);
    yPos = addMultiLineText(
      doc,
      "Declaro que sou proprietário(a) do imóvel descrito acima e autorizo a Lanza Imóveis a intermediar a locação do mesmo, incluindo a divulgação de fotos e informações em meios físicos e eletrônicos. Esta autorização é concedida pelo prazo especificado e poderá ser revogada mediante comunicação por escrito à imobiliária.",
      14,
      yPos,
      180
    );
    
    yPos += 20;
    
    // Date and signature spaces
    doc.text(`Data: ${formatDate(new Date().toString())}`, 14, yPos);
    
    // Signature
    if (assinatura) {
      yPos += 10;
      doc.text("Assinatura:", 14, yPos);
      yPos += 5;
      
      try {
        // Add signature image with better size
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 80, 40); // Aumentado o tamanho da assinatura
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 40;
        doc.text("(Assinatura não disponível)", 14, yPos);
      }
    } else {
      yPos += 10;
      doc.text("Assinatura: ___________________________________________", 14, yPos);
    }
    
    // Generate the PDF blob
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};

// Generate appropriate PDF based on form type
export const generatePdfByFormType = (
  formType: string, 
  formData: any, 
  assinatura?: string
): Promise<Blob> => {
  switch (formType) {
    case 'ficha-fiador-pf':
      return generateFichaCadastralFiadorPFPdf(formData, assinatura);
    case 'ficha-locataria-pj':
      return generateFichaCadastralLocatariaPJPdf(formData, assinatura);
    case 'cadastro-imovel':
      return generateCadastroImovelPdf(formData, assinatura);
    case 'ficha-locataria-pf':
      return generateFichaCadastralLocatarioPFPdf(formData, assinatura);
    case 'proposta-compra':
      return generatePropostaCompraPdf(formData, assinatura);
    case 'proposta-locacao':
      return generatePropostaLocacaoPdf(formData, assinatura);
    case 'autorizacao-imoveis':
      return generateAutorizacaoImoveisPdf(formData, assinatura);
    case 'autorizacao-foto-venda':
      return generateAutorizacaoFotoVendaPdf(formData, assinatura);
    case 'autorizacao-foto-locacao':
      return generateAutorizacaoFotoLocacaoPdf(formData, assinatura);
    default:
      return Promise.reject(new Error('Tipo de formulário não suportado'));
  }
};
