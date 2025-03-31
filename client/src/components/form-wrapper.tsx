import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FormWrapperProps {
  title: string;
  children: ReactNode;
}

export default function FormWrapper({ title, children }: FormWrapperProps) {
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}