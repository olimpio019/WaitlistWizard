import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FichaFiadorPF from "@/pages/ficha-fiador-pf";
import FichaLocatariaPJ from "@/pages/ficha-locataria-pj";
import CadastroImovel from "@/pages/cadastro-imovel";
import LoginPage from "@/pages/login";
import Home from "@/pages/home";
import Relatorios from "@/pages/relatorios";
import Configuracoes from "@/pages/configuracoes";
import Perfil from "@/pages/perfil";
import FichaLocatariaPF from "@/pages/ficha-locataria-pf";
import PropostaCompra from "@/pages/proposta-compra";
import PropostaLocacao from "@/pages/proposta-locacao";
import AutorizacaoImoveis from "@/pages/autorizacao-imoveis";
import AutorizacaoFotoVenda from "@/pages/autorizacao-foto-venda";
import AutorizacaoFotoLocacao from "@/pages/autorizacao-foto-locacao";
import MainLayout from "@/components/main-layout";
import AuthLayout from "@/components/auth-layout";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

// Rotas protegidas para usuários autenticados
const ProtectedRoute = ({ component: Component, admin = false, ...rest }: any) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Se a rota exigir admin e o usuário não for admin, redireciona para o dashboard
  if (admin && !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return <Component {...rest} />;
};

// Rotas públicas para usuários não autenticados
const PublicRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Se estiver autenticado, redireciona para o dashboard
  if (isAuthenticated && !isLoading) {
    return <Redirect to="/" />;
  }
  
  // Se não estiver autenticado, mostra o componente
  return (
    <AuthLayout>
      <Component {...rest} />
    </AuthLayout>
  );
};

function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/">
        <MainLayout>
          <Home />
        </MainLayout>
      </Route>
      <Route path="/login">
        <PublicRoute component={LoginPage} />
      </Route>
      <Route path="/forms/ficha-fiador-pf">
        <MainLayout>
          <FichaFiadorPF />
        </MainLayout>
      </Route>
      <Route path="/forms/ficha-locataria-pj">
        <MainLayout>
          <FichaLocatariaPJ />
        </MainLayout>
      </Route>
      <Route path="/forms/cadastro-imovel">
        <MainLayout>
          <CadastroImovel />
        </MainLayout>
      </Route>
      <Route path="/forms/ficha-locataria-pf">
        <MainLayout>
          <FichaLocatariaPF />
        </MainLayout>
      </Route>
      <Route path="/forms/proposta-compra">
        <MainLayout>
          <PropostaCompra />
        </MainLayout>
      </Route>
      <Route path="/forms/proposta-locacao">
        <MainLayout>
          <PropostaLocacao />
        </MainLayout>
      </Route>
      <Route path="/forms/autorizacao-imoveis">
        <MainLayout>
          <AutorizacaoImoveis />
        </MainLayout>
      </Route>
      <Route path="/forms/autorizacao-foto-venda">
        <MainLayout>
          <AutorizacaoFotoVenda />
        </MainLayout>
      </Route>
      <Route path="/forms/autorizacao-foto-locacao">
        <MainLayout>
          <AutorizacaoFotoLocacao />
        </MainLayout>
      </Route>

      {/* Rotas protegidas - apenas admin */}
      <Route path="/admin">
        <ProtectedRoute component={Dashboard} admin={true} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={Dashboard} admin={true} />
      </Route>
      <Route path="/admin/relatorios">
        <ProtectedRoute component={Relatorios} admin={true} />
      </Route>
      <Route path="/admin/configuracoes">
        <ProtectedRoute component={Configuracoes} admin={true} />
      </Route>
      <Route path="/admin/perfil">
        <ProtectedRoute component={Perfil} admin={true} />
      </Route>
      
      {/* Rota 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;