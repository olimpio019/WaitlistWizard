import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, DownloadIcon, BarChart, PieChart, TrendingUp, Users, Home } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function Relatorios() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Interface para os dados de stats
  interface StatsData {
    totalCadastros: number;
    imoveisDisponiveis: number;
    contratosPendentes: number;
    documentosPendentes: number;
  }
  
  // Obtenção dos dados para relatórios
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? formatDate(date) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="ocupacao">Ocupação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cadastros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalCadastros}</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Imóveis Disponíveis</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats?.imoveisDisponiveis}</div>
                <p className="text-xs text-muted-foreground">
                  +0.5% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos Pendentes</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats?.contratosPendentes}</div>
                <p className="text-xs text-muted-foreground">
                  -1.5% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : stats?.documentosPendentes}</div>
                <p className="text-xs text-muted-foreground">
                  +4.5% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Cadastros por Tipo</CardTitle>
                <CardDescription>
                  Distribuição de cadastros por tipo de formulário
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 h-80 flex items-center justify-center">
                <PieChart className="h-40 w-40 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Atividade Mensal</CardTitle>
                <CardDescription>
                  Novos cadastros nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 h-80 flex items-center justify-center">
                <BarChart className="h-40 w-40 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financeiro" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Financeiro</CardTitle>
              <CardDescription>
                Visualize os dados financeiros relacionados aos imóveis e contratos
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Dados financeiros serão exibidos aqui.</p>
                <p className="text-sm text-muted-foreground">Implemente a visualização de acordo com as necessidades da imobiliária.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ocupacao" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Ocupação</CardTitle>
              <CardDescription>
                Analise as taxas de ocupação dos imóveis gerenciados
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Dados de ocupação serão exibidos aqui.</p>
                <p className="text-sm text-muted-foreground">Implemente a visualização de acordo com as necessidades da imobiliária.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}