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
import { autorizacaoImoveisSchema } from '@shared/schema';
import type { AutorizacaoImoveis } from '@shared/schema';
import { formatCPF, formatPhone } from '@/lib/utils';
import SignaturePad from '@/components/signature-pad';
import { generatePdfByFormType } from '@/lib/pdf-generator';
import FormWrapper from '@/components/form-wrapper';

export default function AutorizacaoImoveis() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assinatura, setAssinatura] = useState<string | undefined>();
  
  // Define o formulário com o esquema de validação
  const form = useForm<AutorizacaoImoveis>({
    resolver: zodResolver(autorizacaoImoveisSchema),
    defaultValues: {
      nomeProprietario: '',
      cpfCnpjProprietario: '',
      emailProprietario: '',
      telefoneProprietario: '',
      enderecoImovel: '',
      tipoImovel: '',
      areaImovel: '',
      tipoAutorizacao: 'Venda e Locação',
      valorDesejado: '',
      prazoAutorizacao: '6 meses',
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
        title: 'Autorização enviada com sucesso!',
        description: 'Sua autorização foi enviada e entraremos em contato em breve.',
      });
      form.reset();
      setAssinatura(undefined);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: 'Erro ao enviar autorização',
        description: 'Ocorreu um erro ao enviar sua autorização. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: AutorizacaoImoveis) => {
    setIsSubmitting(true);
    
    // Adiciona a assinatura aos dados do formulário
    data.assinatura = assinatura;
    
    try {
      // Gera o PDF
      const pdfBlob = await generatePdfByFormType('autorizacao-imoveis', data, assinatura);
      
      // Cria um objeto FormData para enviar o formulário e o PDF
      const formData = new FormData();
      formData.append('tipoFormulario', 'autorizacao-imoveis');
      formData.append('formData', JSON.stringify(data));
      formData.append('arquivo', new File([pdfBlob], `autorizacao-imoveis-${data.nomeProprietario}.pdf`, { type: 'application/pdf' }));
      
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
    <FormWrapper title="Autorização Lanza Imóveis">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Proprietário</CardTitle>
              <CardDescription>Informe seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nomeProprietario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do proprietário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpfCnpjProprietario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="CPF ou CNPJ" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value;
                            // Se for CPF
                            if (value.length <= 14) {
                              field.onChange(formatCPF(value));
                            } else {
                              // Para CNPJ mantemos apenas os números
                              field.onChange(value.replace(/\D/g, ''));
                            }
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
                  name="emailProprietario"
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
                  name="telefoneProprietario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações do Imóvel</CardTitle>
              <CardDescription>Dados do imóvel a ser autorizado</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="enderecoImovel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço do Imóvel</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo do imóvel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoImovel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Imóvel</FormLabel>
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
                          <SelectItem value="Casa">Casa</SelectItem>
                          <SelectItem value="Apartamento">Apartamento</SelectItem>
                          <SelectItem value="Terreno">Terreno</SelectItem>
                          <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                          <SelectItem value="Loja">Loja</SelectItem>
                          <SelectItem value="Galpão">Galpão</SelectItem>
                          <SelectItem value="Chácara">Chácara</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="areaImovel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área do Imóvel (m²)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 60" {...field} />
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
              <CardTitle>Detalhes da Autorização</CardTitle>
              <CardDescription>Informações sobre a autorização</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tipoAutorizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Autorização</FormLabel>
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
                          <SelectItem value="Venda">Venda</SelectItem>
                          <SelectItem value="Locação">Locação</SelectItem>
                          <SelectItem value="Venda e Locação">Venda e Locação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorDesejado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Desejado</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prazoAutorizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo da Autorização</FormLabel>
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
                          <SelectItem value="3 meses">3 meses</SelectItem>
                          <SelectItem value="6 meses">6 meses</SelectItem>
                          <SelectItem value="12 meses">12 meses</SelectItem>
                          <SelectItem value="24 meses">24 meses</SelectItem>
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
                        Declaro que sou proprietário(a) do imóvel descrito acima e autorizo a Lanza Imóveis a intermediar a venda e/ou locação do mesmo, de acordo com as condições estabelecidas. Esta autorização é concedida em caráter não exclusivo e poderá ser revogada a qualquer momento mediante comunicação por escrito.
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
                {isSubmitting ? 'Enviando...' : 'Enviar Autorização'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormWrapper>
  );
}