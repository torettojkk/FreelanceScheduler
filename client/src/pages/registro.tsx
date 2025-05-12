import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building, Loader2 } from "lucide-react";
import { Business } from "@shared/schema";

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Registro() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ businessSlug: string }>("/registro/:businessSlug");
  const { registerMutation, user } = useAuth();
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Define o slug quando a rota corresponder
  useEffect(() => {
    if (match && params.businessSlug) {
      setBusinessSlug(params.businessSlug);
    }
  }, [match, params]);

  // Busca informações do estabelecimento pelo slug
  const { data: business, isLoading: isLoadingBusiness, isError: isErrorBusiness } = useQuery<Business>({
    queryKey: ["/api/businesses/slug", businessSlug],
    queryFn: async () => {
      if (!businessSlug) return null;
      try {
        const res = await fetch(`/api/businesses/slug/${businessSlug}`);
        if (!res.ok) throw new Error("Estabelecimento não encontrado");
        return await res.json();
      } catch (error) {
        toast({
          title: "Erro ao carregar estabelecimento",
          description: "O link que você está tentando acessar é inválido ou expirou.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!businessSlug,
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    
    registerMutation.mutate({
      ...userData,
      role: "client",
      businessId: business?.id,
    }, {
      onSuccess: () => {
        toast({
          title: "Registro concluído!",
          description: "Sua conta foi criada com sucesso. Seja bem-vindo!",
        });
        navigate("/");
      },
      onError: (error: Error) => {
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  if (!businessSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>
              O link de registro que você está tentando acessar é inválido.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/auth">
              <Button>Ir para a página de login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando informações...</p>
      </div>
    );
  }

  if (isErrorBusiness || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Estabelecimento não encontrado</CardTitle>
            <CardDescription>
              O estabelecimento que você está procurando não foi encontrado ou o link expirou.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/auth">
              <Button>Ir para a página de login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="hidden md:flex md:w-1/2 bg-primary/10 items-center justify-center p-8">
        <div className="max-w-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Building className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
          </div>
          
          <h2 className="text-3xl font-bold">Bem-vindo ao AgendaHub</h2>
          <p className="text-muted-foreground">
            Crie sua conta para agendar serviços com {business.name}. 
            Após o registro, você poderá visualizar serviços disponíveis e 
            fazer agendamentos de forma rápida e prática.
          </p>
          
          <div className="mt-8 space-y-3">
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium">Crie sua conta</h3>
                <p className="text-sm text-muted-foreground">Preencha o formulário com seus dados</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium">Explore os serviços</h3>
                <p className="text-sm text-muted-foreground">Veja os serviços disponíveis no estabelecimento</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium">Agende seu horário</h3>
                <p className="text-sm text-muted-foreground">Escolha dia e horário para seu agendamento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="md:hidden flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Building className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold">{business.name}</h1>
            </div>
            <CardTitle>Crie sua conta</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para se cadastrar e agendar serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name" 
                  {...form.register("name")} 
                  placeholder="Digite seu nome completo"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...form.register("email")} 
                  placeholder="Digite seu e-mail"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  {...form.register("password")} 
                  placeholder="Digite sua senha"
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme sua senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  {...form.register("confirmPassword")} 
                  placeholder="Digite sua senha novamente"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-2"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Processando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-center text-sm">
              Já possui uma conta?{" "}
              <Link href="/auth" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}