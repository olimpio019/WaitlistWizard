import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FichaFiadorPF from "@/pages/ficha-fiador-pf";
import FichaLocatariaPJ from "@/pages/ficha-locataria-pj";
import CadastroImovel from "@/pages/cadastro-imovel";
import MainLayout from "@/components/main-layout";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/forms/ficha-fiador-pf" component={FichaFiadorPF} />
        <Route path="/forms/ficha-locataria-pj" component={FichaLocatariaPJ} />
        <Route path="/forms/cadastro-imovel" component={CadastroImovel} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
