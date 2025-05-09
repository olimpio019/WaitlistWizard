import { useState } from "react";
import { Link } from "wouter";
import { Building, FileText, Home as HomeIcon, ChevronsRight, User, ShoppingCart, Key, FileCheck, Camera, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const formCards = [
    {
      id: 1,
      title: "Ficha Cadastral - Fiador PF",
      description: "Formulário para cadastro de fiadores pessoa física",
      icon: <FileText className="h-12 w-12 text-primary" />,
      link: "/forms/ficha-fiador-pf"
    },
    {
      id: 2,
      title: "Ficha Cadastral - Locatária PJ",
      description: "Formulário para cadastro de locatários pessoa jurídica",
      icon: <Building className="h-12 w-12 text-primary" />,
      link: "/forms/ficha-locataria-pj"
    },
    {
      id: 3,
      title: "Cadastro de Imóvel",
      description: "Formulário para cadastro de imóveis disponíveis",
      icon: <HomeIcon className="h-12 w-12 text-primary" />,
      link: "/forms/cadastro-imovel"
    },
    {
      id: 4,
      title: "Ficha Cadastral - Locatário PF",
      description: "Formulário para cadastro de locatários pessoa física",
      icon: <User className="h-12 w-12 text-primary" />,
      link: "/forms/ficha-locataria-pf"
    },
    {
      id: 5,
      title: "Proposta de Compra",
      description: "Formulário de proposta para compra de imóvel",
      icon: <ShoppingCart className="h-12 w-12 text-primary" />,
      link: "/forms/proposta-compra"
    },
    {
      id: 6,
      title: "Proposta para Locação",
      description: "Formulário de proposta para locação de imóvel",
      icon: <Key className="h-12 w-12 text-primary" />,
      link: "/forms/proposta-locacao"
    },
    {
      id: 7,
      title: "Autorização Lanza Imóveis",
      description: "Autorização para comercialização de imóvel",
      icon: <FileCheck className="h-12 w-12 text-primary" />,
      link: "/forms/autorizacao-imoveis"
    },
    {
      id: 8,
      title: "Autorização com Foto - Venda",
      description: "Autorização para venda com fotos do imóvel",
      icon: <Camera className="h-12 w-12 text-primary" />,
      link: "/forms/autorizacao-foto-venda"
    },
    {
      id: 9,
      title: "Autorização com Foto - Locação",
      description: "Autorização para locação com fotos do imóvel",
      icon: <ImageIcon className="h-12 w-12 text-primary" />,
      link: "/forms/autorizacao-foto-locacao"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo Imobiliária Confiança" className="h-20" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Sistema de Inteligência Imobiliária</h1>
        <p className="text-xl text-muted-foreground">
          Preencha os formulários abaixo para cadastro em nosso sistema
        </p>
      </header>

      {isAuthenticated && isAdmin && (
        <div className="max-w-md mx-auto mb-12 bg-primary/10 rounded-lg p-4 text-center">
          <p className="font-medium mb-2">Você está logado como administrador</p>
          <Button asChild variant="default">
            <Link href="/admin">
              Acessar Dashboard Admin <ChevronsRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {formCards.map((card) => (
          <Link 
            key={card.id}
            href={card.link}
            className="block transition-all duration-300 hover:no-underline"
          >
            <Card 
              className={`h-full transition-all duration-300 ${
                hoveredCard === card.id ? 'shadow-lg scale-[1.02] border-primary' : 'shadow border'
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="pb-2">
                <div className="mb-4 flex justify-center">
                  {card.icon}
                </div>
                <CardTitle className="text-center">{card.title}</CardTitle>
                <CardDescription className="text-center">{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Clique para acessar o formulário e preencher suas informações
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant={hoveredCard === card.id ? "default" : "outline"}
                  className="transition-all duration-300"
                >
                  Acessar Formulário
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Nossa Gestão Imobiliária</h2>
        <p className="text-muted-foreground mb-4">
          Nossa empresa oferece serviços completos de gestão imobiliária, 
          incluindo locação, administração e venda.
          Com 42 anos de experiência, garantimos segurança e tranquilidade
          para todos os nossos clientes.
        </p>
        <p className="text-muted-foreground">
          Preencha os formulários acima para iniciar seu cadastro em nosso sistema.
          Nossa equipe entrará em contato para dar sequência ao processo.
        </p>
      </div>
    </div>
  );
}