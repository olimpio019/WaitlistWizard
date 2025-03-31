import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fichaCadastralLocatariaPJSchema, type FichaCadastralLocatariaPJ } from "@shared/schema";
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
import { generateFichaCadastralLocatariaPJPdf } from "@/lib/pdf-generator";

export default function FichaLocatariaPJ() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  const form = useForm<FichaCadastralLocatariaPJ>({
    resolver: zodResolver(fichaCadastralLocatariaPJSchema),
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      inscricaoEstadual: "",
      dataFundacao: "",
      ramoAtividade: "",
      representanteLegal: "",
      cpfRepresentante: "",
      cargoRepresentante: "",
      email: "",
      celular: "",
      telefone: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      codigoImovel: "",
      valorAluguel: "",
      prazoContrato: "",
      finalidadeLocacao: "",
      terms: false,
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Generate PDF from form data
      const formValues = form.getValues();
      const pdfBlob = await generateFichaCadastralLocatariaPJPdf(formValues, signatureDataUrl);
      const pdfFile = new File([pdfBlob], `ficha-locataria-pj-${formValues.razaoSocial.replace(/\s+/g, '-')}.pdf`, {
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
  
  const onSubmit = async (data: FichaCadastralLocatariaPJ) => {
    // Check if signature is empty
    if (signaturePadRef.current?.isEmpty()) {
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
    formData.append('tipoFormulario', 'ficha-locataria-pj');
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
        <h1 className="text-2xl font-bold">Ficha Cadastral Locatária PJ</h1>
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
              {/* Company Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Razão Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a razão social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome fantasia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inscricaoEstadual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inscrição Estadual</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a inscrição estadual (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataFundacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fundação</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ramoAtividade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ramo de Atividade</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o ramo de atividade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Legal Representative */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Representante Legal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="representanteLegal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome do Representante Legal</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpfRepresentante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do Representante</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cargoRepresentante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo do Representante</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o cargo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemplo@empresa.com" {...field} />
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
                          <Input placeholder="(00) 00000-0000" {...field} />
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
                        <FormLabel>Telefone Fixo</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Endereço
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
                          <Input placeholder="Sala, Andar, etc." {...field} />
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

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Informações do Imóvel
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
                    name="prazoContrato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo do Contrato (meses)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="60" placeholder="12" {...field} />
                        </FormControl>
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
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="escritorio">Escritório</SelectItem>
                            <SelectItem value="deposito">Depósito</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
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
