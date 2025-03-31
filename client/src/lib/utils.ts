import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function formatCPF(cpf: string): string {
  // Remove non-digits
  cpf = cpf.replace(/\D/g, '');
  
  // Apply CPF format
  if (cpf.length <= 11) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

export function formatCNPJ(cnpj: string): string {
  // Remove non-digits
  cnpj = cnpj.replace(/\D/g, '');
  
  // Apply CNPJ format
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatPhone(phone: string): string {
  // Remove non-digits
  phone = phone.replace(/\D/g, '');
  
  // Format according to length
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Cellphone
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // Landline
  }
  
  return phone;
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('pt-BR');
}

export function formatCEP(cep: string): string {
  // Remove non-digits
  cep = cep.replace(/\D/g, '');
  
  // Apply CEP format
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function getFormName(formType: string): string {
  switch (formType) {
    case 'ficha-fiador-pf':
      return 'Ficha Cadastral Fiador PF';
    case 'ficha-locataria-pj':
      return 'Ficha Cadastral Locatária PJ';
    case 'cadastro-imovel':
      return 'Cadastro de Imóvel';
    default:
      return formType;
  }
}

export function truncateString(str: string, length: number = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}
