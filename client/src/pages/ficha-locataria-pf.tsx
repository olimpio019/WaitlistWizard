import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { fichaCadastralLocatarioPFSchema } from '@shared/schema';
import type { FichaCadastralLocatarioPF } from '@shared/schema';
import { formatCPF, formatCEP, formatPhone } from '@/lib/utils';
import SignaturePad from '@/components/signature-pad';
import { generatePdfByFormType } from '@/lib/pdf-generator';
import FormWrapper from '@/components/form-wrapper';

export default function FichaLocatariaPF() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assinatura, setAssinatura] = useState<string | undefined>();
  
  // Define o formulário com o esquema de validação
  const form = useForm<FichaCadastralLocatarioPF>({
    resolver: zodResolver(fichaCadastralLocatarioPFSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      estadoCivil: '',
      profissao: '',
      nacionalidade: 'Brasileira',
      rendaMensal: '',
      localTrabalho: '',
      tempoTrabalho: '',
      email: '',
      celular: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      codigoImovel: '',
      valorAluguel: '',
      prazoContrato: '30 meses',
      finalidadeLocacao: 'Residencial',
      terms: false,
    }
  });
  
  // Mutation para enviar os dados do formulário
  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest({
        url: '/api/submissions',
        method: 'POST',
        data: formData
      });
    },
    onSuccess: () => {
      toast({
        title: 'Ficha cadastral enviada com sucesso!',
        description: 'Seus dados foram enviados e serão analisados em breve.',
      });
      form.reset();
      setAssinatura(undefined);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: 'Erro ao enviar formulário',
        description: 'Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // Função para buscar endereço por CEP
  const buscarCEP = async (cep: string) => {
    if (cep.length < 8) return;
    
    const cleanCEP = cep.replace(/\D/g, '');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.setValue('logradouro', data.logradouro || '');
        form.setValue('bairro', data.bairro || '');
        form.setValue('cidade', data.localidade || '');
        form.setValue('estado', data.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };
  
  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: FichaCadastralLocatarioPF) => {
    setIsSubmitting(true);
    
    // Adiciona a assinatura aos dados do formulário
    data.assinatura = assinatura;
    
    try {
      // Gera o PDF
      const pdfBlob = await generatePdfByFormType('ficha-locataria-pf', data, assinatura);
      
      // Cria um objeto FormData para enviar o formulário e o PDF
      const formData = new FormData();
      formData.append('tipoFormulario', 'ficha-locataria-pf');
      formData.append('formData', JSON.stringify(data));
      formData.append('arquivo', new File([pdfBlob], `ficha-locataria-pf-${data.nome}.pdf`, { type: 'application/pdf' }));
      
      // Envia o formulário
      submitMutation.mutate(formData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormWrapper title="Ficha Cadastral - Locatário Pessoa Física">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informe seus dados pessoais completos</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(formatCPF(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estadoCivil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Civil</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                          <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                          <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                          <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                          <SelectItem value="União Estável">União Estável</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissão</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua profissão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nacionalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Nacionalidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>Dados financeiros e profissionais</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rendaMensal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renda Mensal</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="localTrabalho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de Trabalho</FormLabel>
                      <FormControl>
                        <Input placeholder="Empresa onde trabalha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tempoTrabalho"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Trabalho</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 2 anos e 3 meses" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Informações para contato</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(formatPhone(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 0000-0000" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(formatPhone(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Informe seu endereço residencial atual</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field} 
                          onChange={(e) => {
                            const val = formatCEP(e.target.value);
                            field.onChange(val);
                            if (val.replace(/\D/g, '').length === 8) {
                              buscarCEP(val);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logradouro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações do Imóvel Pretendido</CardTitle>
              <CardDescription>Dados do imóvel que deseja alugar</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codigoImovel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Imóvel</FormLabel>
                      <FormControl>
                        <Input placeholder="Código do imóvel (se disponível)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorAluguel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Aluguel</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prazoContrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo do Contrato</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12 meses">12 meses</SelectItem>
                          <SelectItem value="24 meses">24 meses</SelectItem>
                          <SelectItem value="30 meses">30 meses</SelectItem>
                          <SelectItem value="36 meses">36 meses</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="finalidadeLocacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finalidade da Locação</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Residencial">Residencial</SelectItem>
                          <SelectItem value="Comercial">Comercial</SelectItem>
                          <SelectItem value="Misto">Misto</SelectItem>
                          <SelectItem value="Temporada">Temporada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>Assine com o mouse ou dedo (dispositivos touch)</CardDescription>
            </CardHeader>
            <CardContent>
              <SignaturePad
                onChange={setAssinatura}
                height={200}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Termos e Condições
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Declaro que as informações fornecidas são verdadeiras e autorizo a Lanza Imóveis a consultar minhas referências pessoais, profissionais e de crédito.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Limpar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Ficha Cadastral'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormWrapper>
  );
}