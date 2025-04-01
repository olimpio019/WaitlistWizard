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
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { propostaCompraSchema } from '@shared/schema';
import type { PropostaCompra } from '@shared/schema';
import { formatCPF, formatCEP, formatPhone } from '@/lib/utils';
import SignaturePad from '@/components/signature-pad';
import { generatePdfByFormType } from '@/lib/pdf-generator';
import FormWrapper from '@/components/form-wrapper';

export default function PropostaCompra() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assinatura, setAssinatura] = useState<string | undefined>();
  
  // Define o formulário com o esquema de validação
  const form = useForm<PropostaCompra>({
    resolver: zodResolver(propostaCompraSchema),
    defaultValues: {
      nomeComprador: '',
      cpfComprador: '',
      email: '',
      celular: '',
      telefone: '',
      codigoImovel: '',
      enderecoImovel: '',
      valorProposta: '',
      condicaoPagamento: '',
      valorEntrada: '',
      formaPagamento: '',
      dataValidade: '',
      observacoes: '',
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
        title: 'Proposta de compra enviada com sucesso!',
        description: 'Sua proposta foi enviada e será analisada em breve.',
      });
      form.reset();
      setAssinatura(undefined);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: 'Erro ao enviar proposta',
        description: 'Ocorreu um erro ao enviar sua proposta. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: PropostaCompra) => {
    setIsSubmitting(true);
    
    // Adiciona a assinatura aos dados do formulário
    data.assinatura = assinatura;
    
    try {
      // Gera o PDF
      const pdfBlob = await generatePdfByFormType('proposta-compra', data, assinatura);
      
      // Cria um objeto FormData para enviar o formulário e o PDF
      const formData = new FormData();
      formData.append('tipoFormulario', 'proposta-compra');
      formData.append('formData', JSON.stringify(data));
      formData.append('arquivo', new File([pdfBlob], `proposta-compra-${data.nomeComprador}.pdf`, { type: 'application/pdf' }));
      
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
    <FormWrapper title="Proposta de Compra de Imóvel">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Comprador</CardTitle>
              <CardDescription>Informe seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nomeComprador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do comprador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpfComprador"
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
              <CardTitle>Informações do Imóvel</CardTitle>
              <CardDescription>Dados do imóvel que deseja comprar</CardDescription>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Proposta</CardTitle>
              <CardDescription>Informações sobre a proposta de compra</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valorProposta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Proposta</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Entrada</FormLabel>
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
                  name="condicaoPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
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
                          <SelectItem value="À Vista">À Vista</SelectItem>
                          <SelectItem value="Financiamento Bancário">Financiamento Bancário</SelectItem>
                          <SelectItem value="Parcelamento Direto">Parcelamento Direto</SelectItem>
                          <SelectItem value="FGTS">FGTS</SelectItem>
                          <SelectItem value="Consórcio">Consórcio</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Transferência bancária, cheque, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataValidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade da Proposta</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais ou observações sobre a proposta" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        Declaro que as informações fornecidas são verdadeiras e estou ciente de que esta proposta está sujeita à análise e aprovação por parte do vendedor e da imobiliária. Estou ciente também de que, caso a proposta seja aceita, comprometo-me a cumprir com as condições de pagamento aqui estabelecidas.
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
                {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormWrapper>
  );
}