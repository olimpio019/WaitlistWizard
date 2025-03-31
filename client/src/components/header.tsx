import { useState } from "react";
import { Link } from "wouter";
import { Menu, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui-theme-toggle";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar desconectar",
      });
    }
  };

  const isLinkActive = (path: string) => location === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-xl font-bold">Sistema Imobiliária</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <ThemeToggle />

            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/" className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isLinkActive("/") 
                  ? "text-primary dark:text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              )}>
                Painel
              </Link>
              <Link href="/forms/ficha-fiador-pf" className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isLinkActive("/forms/ficha-fiador-pf") || isLinkActive("/forms/ficha-locataria-pj") || isLinkActive("/forms/cadastro-imovel")
                  ? "text-primary dark:text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
              )}>
                Formulários
              </Link>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Relatórios
              </a>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center space-x-2" size="sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    {user && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{user.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {isAdmin ? 'Administrador' : 'Usuário'}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && (
                    <>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{user.nome}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/" className="cursor-pointer flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("lg:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className={cn(
            "block px-3 py-2 rounded-md text-base font-medium",
            isLinkActive("/") 
              ? "bg-primary text-white" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}>
            Painel
          </Link>
          <Link href="/forms/ficha-fiador-pf" className={cn(
            "block px-3 py-2 rounded-md text-base font-medium",
            isLinkActive("/forms/ficha-fiador-pf") 
              ? "bg-primary text-white" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}>
            Ficha Cadastral Fiador PF
          </Link>
          <Link href="/forms/ficha-locataria-pj" className={cn(
            "block px-3 py-2 rounded-md text-base font-medium",
            isLinkActive("/forms/ficha-locataria-pj") 
              ? "bg-primary text-white" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}>
            Ficha Cadastral Locatária PJ
          </Link>
          <Link href="/forms/cadastro-imovel" className={cn(
            "block px-3 py-2 rounded-md text-base font-medium",
            isLinkActive("/forms/cadastro-imovel") 
              ? "bg-primary text-white" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}>
            Cadastro de Imóvel
          </Link>
          <a href="#" className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Relatórios
          </a>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
