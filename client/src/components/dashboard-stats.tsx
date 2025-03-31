import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Home, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatsData {
  totalCadastros: number;
  imoveisDisponiveis: number;
  contratosPendentes: number;
  documentosPendentes: number;
}

export default function DashboardStats() {
  const { data, isLoading, error } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
        Erro ao carregar estatísticas
      </div>
    );
  }

  const stats = data || {
    totalCadastros: 0,
    imoveisDisponiveis: 0,
    contratosPendentes: 0,
    documentosPendentes: 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total de Cadastros</p>
              <h3 className="font-bold text-3xl">{stats.totalCadastros}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-emerald-500">
              <Home className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Imóveis Disponíveis</p>
              <h3 className="font-bold text-3xl">{stats.imoveisDisponiveis}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-500">
              <FileText className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Contratos Pendentes</p>
              <h3 className="font-bold text-3xl">{stats.contratosPendentes}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-500">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Documentos Pendentes</p>
              <h3 className="font-bold text-3xl">{stats.documentosPendentes}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
