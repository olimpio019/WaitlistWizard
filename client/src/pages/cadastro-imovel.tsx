import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cadastroImovelSchema, type CadastroImovel } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SignaturePad, { SignaturePadRef } from "@/components/signature-pad";
import { generateCadastroImovelPdf } from "@/lib/pdf-generator";

export default function CadastroImovel() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  const form = useForm<CadastroImovel>({
    resolver: zodResolver(cadastroImovelSchema),
    defaultValues: {
      codigoImovel: "",
      tipoImovel: "",
      finalidade: "",
      valorAluguel: "",
      valorVenda: "",
      areaTotal: "",
      areaConstruida: "",
      quartos: "",
      banheiros: "",
      suites: "",
      vagasGaragem: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      nomeProprietario: "",
      cpfCnpjProprietario: "",
      telefoneProprietario: "",
      emailProprietario: "",
      descricao: "",
      caracteristicas: "",
      observacoes: "",
      terms: false,
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Generate PDF from form data
      const formValues = form.getValues();
      const pdfBlob = await generateCadastroImovelPdf(formValues, signatureDataUrl);
      const pdfFile = new File([pdfBlob], `cadastro-imovel-${formValues.codigoImovel.replace(/\s+/g, '-')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Append PDF to form data
      formData.append('arquivo', pdfFile);
      
      // Custom fetch to handle FormData with files
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Formulário enviado",
        description: "O cadastro foi realizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      navigate("/");
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erro ao enviar formulário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: CadastroImovel) => {
    // Check if signature is empty
    if (!signatureDataUrl) {
      toast({
        title: "Assinatura obrigatória",
        description: "Por favor, assine o formulário antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    // Create form data object to send files
    const formData = new FormData();
    
    // Add signature to data
    data.assinatura = signatureDataUrl;
    
    // Add form type and form data as JSON
    formData.append('tipoFormulario', 'cadastro-imovel');
    formData.append('formData', JSON.stringify(data));
    
    // Add file if selected
    if (selectedFile) {
      formData.append('arquivo', selectedFile);
    }
    
    // Submit the form
    submitMutation.mutate(formData);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleSignatureChange = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };
  
  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignatureDataUrl("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Imóvel</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Property Identification */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Identificação do Imóvel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="codigoImovel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Imóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="IM-XXXX-XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartamento">Apartamento</SelectItem>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="comercial">Sala Comercial</SelectItem>
                            <SelectItem value="terreno">Terreno</SelectItem>
                            <SelectItem value="galpao">Galpão</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="finalidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalidade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aluguel">Aluguel</SelectItem>
                            <SelectItem value="venda">Venda</SelectItem>
                            <SelectItem value="ambos">Aluguel e Venda</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">R$</span>
                            </div>
                            <Input className="pl-10" placeholder="0,00" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valorVenda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Venda (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">R$</span>
                            </div>
                            <Input className="pl-10" placeholder="0,00" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Total (m²)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaConstruida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Construída (m²)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Características
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="quartos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="banheiros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banheiros</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="suites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suítes (opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vagasGaragem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vagas de Garagem</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Property Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Endereço do Imóvel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="000" {...field} />
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
                        <FormLabel>Complemento</FormLabel>
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
                          <Input placeholder="Digite o bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a cidade" {...field} />
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
                              <SelectValue placeholder="Selecione..." />
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
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Informações do Proprietário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="nomeProprietario"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome do Proprietário</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" {...field} />
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
                        <FormLabel>CPF/CNPJ do Proprietário</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00 ou 00.000.000/0000-00" {...field} />
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
                        <FormLabel>Telefone do Proprietário</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailProprietario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail do Proprietário</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemplo@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do imóvel..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caracteristicas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Características</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Armários embutidos, Piso frio, Churrasqueira..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Informações adicionais..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Documentos
                </h3>
                <div className="mb-6">
                  <Label htmlFor="file-upload" className="block text-sm font-medium mb-1">
                    Upload de Documento (PDF)
                  </Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                          <span>Upload de arquivo</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF até 10MB
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-primary">
                          Arquivo selecionado: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Assinatura
                </h3>
                <div className="mb-6">
                  <Label className="block text-sm font-medium mb-1">
                    Assinatura Digital
                  </Label>
                  <SignaturePad 
                    ref={signaturePadRef} 
                    onChange={handleSignatureChange}
                  />
                </div>
              </div>

              {/* Terms and Submit */}
              <div>
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Concordo com os termos e condições
                        </FormLabel>
                        <FormDescription>
                          Ao enviar este formulário, confirmo que todas as informações fornecidas são verdadeiras e completas.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Enviando..." : "Salvar e Gerar PDF"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
