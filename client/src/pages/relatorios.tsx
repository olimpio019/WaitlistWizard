import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, DownloadIcon, TrendingUp, Users, Home, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import jsPDF from "jspdf";

export default function Relatorios() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const reportRef = useRef<HTMLDivElement>(null);
  
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
  
  // Interfaces para tipagem dos dados
  interface ChartItem {
    name: string;
    value: number;
  }
  
  interface ActivityItem {
    name: string;
    cadastros: number;
  }
  
  interface FinancialItem {
    mes: string;
    receita: number;
    despesa: number;
  }
  
  interface OccupationItem {
    mes: string;
    taxa: number;
  }
  
  // Obtenção de dados reais para os gráficos
  const { data: pieChartData = [], isLoading: isPieLoading } = useQuery<ChartItem[]>({
    queryKey: ['/api/stats/by-type'],
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
  
  const { data: monthlyActivityData = [], isLoading: isActivityLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/stats/monthly-activity'],
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
  
  const { data: financialData = [], isLoading: isFinancialLoading } = useQuery<FinancialItem[]>({
    queryKey: ['/api/stats/financial'],
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
  
  const { data: occupationData = [], isLoading: isOccupationLoading } = useQuery<OccupationItem[]>({
    queryKey: ['/api/stats/occupation'],
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];
  
  // Função para exportar o relatório como PDF
  const exportToPDF = () => {
    if (!reportRef.current) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório Imobiliária', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Data: ${formatDate(date || new Date())}`, 105, 30, { align: 'center' });
    
    // Estatísticas
    doc.setFontSize(14);
    doc.text('Estatísticas Gerais', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total de Cadastros: ${stats?.totalCadastros || 0}`, 20, 55);
    doc.text(`Imóveis Disponíveis: ${stats?.imoveisDisponiveis || 0}`, 20, 62);
    doc.text(`Contratos Pendentes: ${stats?.contratosPendentes || 0}`, 20, 69);
    doc.text(`Documentos Pendentes: ${stats?.documentosPendentes || 0}`, 20, 76);
    
    // Informações financeiras
    doc.setFontSize(14);
    doc.text('Dados Financeiros (Último Mês)', 20, 90);
    doc.setFontSize(10);
    doc.text(`Receita Total: ${formatCurrency(5000)}`, 20, 100);
    doc.text(`Despesas: ${formatCurrency(2200)}`, 20, 107);
    doc.text(`Lucro: ${formatCurrency(2800)}`, 20, 114);
    
    // Taxa de ocupação
    doc.setFontSize(14);
    doc.text('Taxa de Ocupação', 20, 130);
    doc.setFontSize(10);
    doc.text(`Taxa Atual: 90%`, 20, 140);
    doc.text(`Média Anual: 82%`, 20, 147);
    
    // Rodapé
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(8);
    doc.text('© Lanza Imóveis - Relatório gerado automaticamente pelo sistema', pageWidth / 2, 285, { align: 'center' });
    
    // Salvar o PDF
    doc.save(`relatorio-${formatDate(date || new Date()).replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6" ref={reportRef}>
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
          <Button onClick={exportToPDF}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar PDF
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
              <CardContent className="pl-2 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} cadastros`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Atividade Mensal</CardTitle>
                <CardDescription>
                  Novos cadastros nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} cadastros`} />
                    <Legend />
                    <Bar dataKey="cadastros" fill="#8884d8" name="Novos Cadastros" />
                  </BarChart>
                </ResponsiveContainer>
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
            <CardContent className="h-[450px]">
              <div className="mb-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Receita Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isFinancialLoading 
                        ? "..." 
                        : formatCurrency(financialData.reduce((sum, item) => sum + item.receita, 0))
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">+12.3% em relação ao ano anterior</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Despesas Anuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isFinancialLoading 
                        ? "..." 
                        : formatCurrency(financialData.reduce((sum, item) => sum + item.despesa, 0))
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">+5.6% em relação ao ano anterior</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isFinancialLoading 
                        ? "..." 
                        : formatCurrency(
                            financialData.reduce((sum, item) => sum + item.receita, 0) - 
                            financialData.reduce((sum, item) => sum + item.despesa, 0)
                          )
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">+23.8% em relação ao ano anterior</p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height="70%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="receita" fill="#8884d8" name="Receita" />
                  <Bar dataKey="despesa" fill="#82ca9d" name="Despesa" />
                </BarChart>
              </ResponsiveContainer>
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
            <CardContent className="h-[450px]">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Ocupação Atual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isOccupationLoading 
                        ? "..." 
                        : occupationData.length 
                          ? `${occupationData[occupationData.length - 1]?.taxa}%` 
                          : "0%"}
                    </div>
                    <p className="text-xs text-muted-foreground">+4.0% em relação ao mês anterior</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Média Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isOccupationLoading 
                        ? "..." 
                        : occupationData.length 
                          ? `${Math.round(occupationData.reduce((sum, item) => sum + item.taxa, 0) / occupationData.length)}%` 
                          : "0%"}
                    </div>
                    <p className="text-xs text-muted-foreground">+7.3% em relação ao ano anterior</p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height="70%">
                <LineChart data={occupationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="taxa" 
                    name="Taxa de Ocupação (%)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}