import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, FileText, BarChart2, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FormSidebar() {
  const [location] = useLocation();
  const [isFormMenuOpen, setIsFormMenuOpen] = useState(true);

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <h2 className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Cadastros
        </h2>
        <ul className="space-y-1">
          <li>
            <Link href="/"
              className={cn(
                "flex items-center p-3 text-base font-medium rounded-lg",
                isActive("/")
                  ? "bg-primary text-white"
                  : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              )}
            >
              <Home
                className={cn(
                  "w-6 h-6 mr-2",
                  isActive("/")
                    ? ""
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                )}
              />
              Dashboard
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex items-center w-full p-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              onClick={() => setIsFormMenuOpen(!isFormMenuOpen)}
            >
              <FileText className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              Formulários
              <ChevronDown
                className={cn(
                  "w-6 h-6 ml-auto transition-transform",
                  isFormMenuOpen ? "rotate-180" : ""
                )}
              />
            </button>
            {isFormMenuOpen && (
              <ul className="py-2 space-y-1 pl-12">
                <li>
                  <Link href="/forms/ficha-fiador-pf"
                    className={cn(
                      "flex items-center p-2 rounded-lg",
                      isActive("/forms/ficha-fiador-pf")
                        ? "bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    Ficha Cadastral Fiador PF
                  </Link>
                </li>
                <li>
                  <Link href="/forms/ficha-locataria-pj"
                    className={cn(
                      "flex items-center p-2 rounded-lg",
                      isActive("/forms/ficha-locataria-pj")
                        ? "bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    Ficha Cadastral Locatária PJ
                  </Link>
                </li>
                <li>
                  <Link href="/forms/cadastro-imovel"
                    className={cn(
                      "flex items-center p-2 rounded-lg",
                      isActive("/forms/cadastro-imovel")
                        ? "bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    Cadastro de Imóvel
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <BarChart2 className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              Relatórios
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <Settings className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              Configurações
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
