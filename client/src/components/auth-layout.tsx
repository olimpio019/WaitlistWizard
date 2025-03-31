import { ReactNode } from "react";
import { Link } from "wouter";
import { Home } from "lucide-react";
import ThemeToggle from "@/components/ui-theme-toggle";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-bold">Sistema Imobiliária</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Sistema de Gerenciamento Imobiliário. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}