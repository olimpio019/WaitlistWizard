import { jsPDF } from "jspdf";
import { FichaCadastralFiadorPF, FichaCadastralLocatariaPJ, CadastroImovel } from "@shared/schema";
import { formatCPF, formatCNPJ, formatPhone, formatDate, formatCEP } from "@/lib/utils";
import logo from "@/assets/logo.svg";

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
        // Add signature image
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 60, 30);
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 30;
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
        // Add signature image
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 60, 30);
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 30;
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
        // Add signature image
        const imgData = assinatura;
        doc.addImage(imgData, 'PNG', 14, yPos, 60, 30);
      } catch (error) {
        console.error("Error adding signature:", error);
        yPos += 30;
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
    default:
      return Promise.reject(new Error('Tipo de formulário não suportado'));
  }
};
