import { useState } from "react";
import { Link } from "wouter";
import { Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui-theme-toggle";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
              <Button 
                variant="ghost" 
                className="flex items-center" 
                size="icon"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Button>
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
        </div>
      </div>
    </header>
  );
}
