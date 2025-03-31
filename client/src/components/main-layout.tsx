import { ReactNode } from "react";
import Header from "@/components/header";
import FormSidebar from "@/components/form-sidebar";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Don't show sidebar on mobile
  const showSidebar = !isMobile;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      
      <div className="flex flex-1">
        {showSidebar && <FormSidebar />}
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
