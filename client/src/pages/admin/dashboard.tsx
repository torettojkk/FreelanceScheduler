import { useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, Building, Users, CalendarCheck, Eye, Edit, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Business } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [generatedUrl, setGeneratedUrl] = useState("");
  
  // Fetch establishments from API
  const { data: establishments, isLoading, isError } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Number of establishments for stats card
  const establishmentsCount = establishments?.length || 0;
  
  // Function to redirect to the establishments page
  const goToNewEstablishmentPage = () => {
    navigate("/admin/establishments");
    toast({
      title: "Criando novo estabelecimento",
      description: "Você foi redirecionado para o formulário completo.",
    });
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    toast({
      title: "URL copiada!",
      description: "Link copiado para a área de transferência.",
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 md:hidden">Dashboard do Administrador</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                  <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estabelecimentos</p>
                  <p className="text-2xl font-bold">{establishmentsCount}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>12% este mês</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">1,284</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>8% este mês</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                  <CalendarCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos</p>
                  <p className="text-2xl font-bold">5,940</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-purple-600 dark:text-purple-400 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>23% este mês</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="establishments">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="pending">Pendências</TabsTrigger>
              </TabsList>
              
              <TabsContent value="establishments" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Estabelecimentos Recentes</CardTitle>
                    <CardDescription>
                      Lista dos estabelecimentos recentemente cadastrados no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Carregando estabelecimentos...</p>
                        </div>
                      ) : isError ? (
                        <div className="text-center py-4 text-destructive">
                          <p>Erro ao carregar estabelecimentos.</p>
                          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                            Tentar novamente
                          </Button>
                        </div>
                      ) : establishments?.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Nenhum estabelecimento cadastrado.</p>
                          <Link href="/admin/establishments">
                            <Button variant="link" className="mt-2">
                              Cadastrar estabelecimento
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2">Nome</th>
                              <th className="text-left py-3 px-2">Proprietário</th>
                              <th className="text-left py-3 px-2">Status</th>
                              <th className="text-left py-3 px-2">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {establishments?.slice(0, 3).map((establishment) => (
                              <tr key={establishment.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2">{establishment.name}</td>
                                <td className="py-3 px-2">{establishment.ownerName}</td>
                                <td className="py-3 px-2">
                                  <Badge 
                                    variant={
                                      establishment.status === "active" ? "success" : 
                                      establishment.status === "inactive" ? "destructive" : 
                                      "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {establishment.status === "active" ? "Ativo" : 
                                     establishment.status === "inactive" ? "Inativo" : 
                                     establishment.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2">
                                  <Link href={`/admin/establishments?id=${establishment.id}`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/admin/establishments?id=${establishment.id}&edit=true`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      
                      <div className="mt-4 text-center">
                        <Link href="/admin/establishments">
                          <Button variant="outline" size="sm">
                            Ver todos os estabelecimentos
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>Gerenciar usuários do sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-6">
                      Funcionalidade em desenvolvimento.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pending" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Pendências</CardTitle>
                    <CardDescription>Itens que precisam de sua atenção</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Verificar cadastro - Auto Mecânica Rapida</p>
                          <p className="text-xs text-muted-foreground">Pendente há 2 dias</p>
                        </div>
                        <Button variant="ghost" className="text-primary">Resolver</Button>
                      </div>
                      <div className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Restaurar acesso - Clínica Bem Estar</p>
                          <p className="text-xs text-muted-foreground">Urgente - 1 dia atraso</p>
                        </div>
                        <Button variant="ghost" className="text-primary">Resolver</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Estabelecimento</CardTitle>
                <CardDescription>
                  Registre um novo estabelecimento na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Utilize o formulário completo de cadastro para adicionar um novo estabelecimento ao sistema.
                  </p>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Benefícios de cadastrar um estabelecimento:</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Acesso à plataforma de agendamentos
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Página personalizada para o negócio
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Gestão de serviços e clientes
                      </li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={goToNewEstablishmentPage}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Novo Estabelecimento
                  </Button>
                  
                  <div className="text-center">
                    <Link href="/admin/establishments">
                      <Button variant="link" size="sm">
                        Ver todos os estabelecimentos
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}