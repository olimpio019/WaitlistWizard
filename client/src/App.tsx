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
import MainLayout from "@/components/main-layout";
import AuthLayout from "@/components/auth-layout";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Rotas protegidas para usuários autenticados
const ProtectedRoute = ({ component: Component, admin = false, ...rest }: any) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Enquanto verifica autenticação, mostra uma tela de carregamento
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Se a rota exigir admin e o usuário não for admin, redireciona para o dashboard
  if (admin && !isAdmin) {
    navigate("/");
    return null;
  }

  // Se passar por todas as verificações, renderiza o componente
  return <MainLayout><Component {...rest} /></MainLayout>;
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

      {/* Rotas protegidas - apenas admin */}
      <Route path="/admin">
        <ProtectedRoute component={Dashboard} admin={true} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={Dashboard} admin={true} />
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