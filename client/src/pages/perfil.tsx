import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  
  const handleSaveProfile = () => {
    setEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Perfil do Usuário</h1>
        <Button 
          variant={editing ? "default" : "outline"} 
          onClick={() => editing ? handleSaveProfile() : setEditing(true)}
        >
          {editing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Perfil
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardContent className="p-6 flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-medium">{user?.nome || "Administrador"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || "admin@lanzaimoveis.com.br"}</p>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cadastrado em:</span>
                <span>{formatDate(new Date())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo de usuário:</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                  Administrador
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="atividade">Atividade</TabsTrigger>
              <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Edite suas informações pessoais e de contato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input 
                        id="nome" 
                        defaultValue={user?.nome || "Administrador"} 
                        disabled={!editing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input 
                        id="username" 
                        defaultValue={user?.username || "admin"} 
                        disabled={!editing} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || "admin@lanzaimoveis.com.br"} 
                      disabled={!editing} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      defaultValue="(11) 95555-5555" 
                      disabled={!editing} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="atividade" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Veja suas últimas atividades no sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Login no sistema", date: "Hoje, 12:30" },
                      { action: "Visualizou cadastro #123", date: "Hoje, 11:45" },
                      { action: "Editou perfil", date: "Ontem, 15:20" },
                      { action: "Gerou relatório", date: "Ontem, 10:15" },
                      { action: "Cadastrou novo imóvel", date: "12/03/2023, 09:30" }
                    ].map((activity, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferencias" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências do Usuário</CardTitle>
                  <CardDescription>
                    Personalize suas preferências de uso do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="idioma">Idioma</Label>
                      <select 
                        id="idioma" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!editing}
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (United States)</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <select 
                        id="timezone" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!editing}
                      >
                        <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                        <option value="America/New_York">América/Nova York (GMT-5)</option>
                        <option value="Europe/London">Europa/Londres (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}