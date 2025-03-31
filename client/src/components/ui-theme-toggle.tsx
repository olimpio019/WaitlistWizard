import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check for dark mode preference on initial component mount
    const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches && 
      localStorage.getItem('darkMode') === null);
    
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {darkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
