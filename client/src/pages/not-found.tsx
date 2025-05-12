import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function NotFound() {
  const { user } = useAuth();
  
  let redirectLink = "/auth";
  let redirectText = "Ir para Login";
  
  if (user) {
    if (user.role === "admin") {
      redirectLink = "/admin";
      redirectText = "Voltar ao Dashboard";
    } else if (user.role === "owner") {
      redirectLink = "/owner";
      redirectText = "Voltar ao Dashboard";
    } else if (user.role === "client") {
      redirectLink = "/client";
      redirectText = "Voltar aos Agendamentos";
    }
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-12 w-12 text-destructive mb-2" />
            <h1 className="text-2xl font-bold">404 - Página Não Encontrada</h1>
            <p className="mt-2 text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
          
          <Link href={redirectLink}>
            <Button className="w-full">
              {redirectText}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
