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
  
  const handleSaveGeneral = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações gerais foram atualizadas com sucesso.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas",
      description: "As configurações de notificações foram atualizadas com sucesso.",
    });
  };
  
  const handleSaveSecurity = () => {
    toast({
      title: "Segurança atualizada",
      description: "As configurações de segurança foram atualizadas com sucesso.",
    });
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
                <Input id="company-name" defaultValue="Lanza Imóveis" />
                <p className="text-sm text-muted-foreground">
                  Este nome será exibido nos cabeçalhos, PDFs e emails.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-email">Email da Empresa</Label>
                <Input id="company-email" defaultValue="contato@lanzaimoveis.com.br" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-phone">Telefone da Empresa</Label>
                <Input id="company-phone" defaultValue="(11) 95555-5555" />
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
                  <Input id="email-template" defaultValue="template-padrao" />
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
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
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