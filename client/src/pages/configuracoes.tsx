import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ui-theme-toggle";
import { useState } from "react";

export default function Configuracoes() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  // Estados para os campos de configuração
  const [companyName, setCompanyName] = useState("Lanza Imóveis");
  const [companyEmail, setCompanyEmail] = useState("contato@lanzaimoveis.com.br");
  const [companyPhone, setCompanyPhone] = useState("(11) 95555-5555");
  
  const handleSaveGeneral = () => {
    // Aqui poderia ter uma chamada à API para salvar as configurações
    
    // Simulação do sucesso da operação
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    }, 500);
  };
  
  // Estados para template de email
  const [emailTemplate, setEmailTemplate] = useState("template-padrao");
  
  // Estados para campos de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const handleSaveNotifications = () => {
    // Aqui poderia ter uma chamada à API para salvar as configurações
    
    setTimeout(() => {
      toast({
        title: "Notificações atualizadas",
        description: "As configurações de notificações foram atualizadas com sucesso.",
      });
    }, 500);
  };
  
  const handleSaveSecurity = () => {
    // Verifica se a nova senha e a confirmação coincidem
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    
    // Verifica se a nova senha tem pelo menos 8 caracteres
    if (newPassword.length < 8) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    
    // Verifica requisitos de complexidade
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecial)) {
      setPasswordError("A senha deve conter letras maiúsculas, minúsculas, números e símbolos.");
      return;
    }
    
    // Limpa o erro se tudo estiver ok
    setPasswordError("");
    
    // Aqui poderia ter uma chamada à API para salvar a nova senha
    
    setTimeout(() => {
      toast({
        title: "Segurança atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Limpa os campos após o sucesso
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e personalize sua experiência.
        </p>
      </div>
      
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input 
                  id="company-name" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                />
                <p className="text-sm text-muted-foreground">
                  Este nome será exibido nos cabeçalhos, PDFs e emails.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-email">Email da Empresa</Label>
                <Input 
                  id="company-email" 
                  value={companyEmail} 
                  onChange={(e) => setCompanyEmail(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-phone">Telefone da Empresa</Label>
                <Input 
                  id="company-phone" 
                  value={companyPhone} 
                  onChange={(e) => setCompanyPhone(e.target.value)} 
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosave">Salvar Automaticamente</Label>
                  <Switch 
                    id="autosave" 
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Salva automaticamente os formulários enquanto você digita.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tema do Sistema</Label>
                  <ThemeToggle />
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha entre tema claro ou escuro para a interface.
                </p>
              </div>
              
              <Button className="w-full mt-4" onClick={handleSaveGeneral}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações e alertas por email.
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas importantes por SMS.
                    </p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="email-template">Template de Email</Label>
                  <Input 
                    id="email-template" 
                    value={emailTemplate} 
                    onChange={(e) => setEmailTemplate(e.target.value)} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Selecione o template padrão para emails enviados pelo sistema.
                  </p>
                </div>
                
                <Button className="w-full mt-4" onClick={handleSaveNotifications}>
                  Salvar Preferências de Notificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança e privacidade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-1">{passwordError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Sua senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Sessões Ativas</Label>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Este Dispositivo</p>
                      <p className="text-sm text-muted-foreground">São Paulo, Brasil • Último acesso: Agora</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Encerrar
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={handleSaveSecurity}>
                Atualizar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}