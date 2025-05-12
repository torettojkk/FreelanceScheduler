import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, Building, Users, CalendarCheck } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleRegisterBusiness = () => {
    if (!businessName || !ownerName || !email || !businessType) {
      toast({
        title: "Erro ao cadastrar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const url = `https://agendahub.com/${businessName.toLowerCase().replace(/\s+/g, '-')}`;
      setGeneratedUrl(url);
      toast({
        title: "Estabelecimento cadastrado com sucesso!",
        description: "URL de cadastro gerada com sucesso.",
      });
    }, 1000);
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
                  <p className="text-2xl font-bold">87</p>
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
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Nome</th>
                            <th className="text-left py-3 px-2">Proprietário</th>
                            <th className="text-left py-3 px-2">Data de Cadastro</th>
                            <th className="text-left py-3 px-2">Status</th>
                            <th className="text-left py-3 px-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">Barbearia Silva</td>
                            <td className="py-3 px-2">João Silva</td>
                            <td className="py-3 px-2">15/05/2023</td>
                            <td className="py-3 px-2">
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Ativo</span>
                            </td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">Estúdio Beleza Pura</td>
                            <td className="py-3 px-2">Maria Santos</td>
                            <td className="py-3 px-2">12/05/2023</td>
                            <td className="py-3 px-2">
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Ativo</span>
                            </td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">Auto Mecânica Rapida</td>
                            <td className="py-3 px-2">Carlos Oliveira</td>
                            <td className="py-3 px-2">10/05/2023</td>
                            <td className="py-3 px-2">
                              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">Pendente</span>
                            </td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                  Registre um novo estabelecimento e gere uma URL única
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nome do Estabelecimento</Label>
                    <Input 
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Nome do estabelecimento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nome do Proprietário</Label>
                    <Input 
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Nome do proprietário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Tipo de Negócio</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger id="businessType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barber">Barbearia</SelectItem>
                        <SelectItem value="salon">Salão de Beleza</SelectItem>
                        <SelectItem value="mechanic">Mecânica</SelectItem>
                        <SelectItem value="clinic">Consultório</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleRegisterBusiness}
                  >
                    Cadastrar e Gerar URL
                  </Button>
                </form>
                
                {generatedUrl && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md">
                    <Label className="text-sm">URL para cadastro de clientes:</Label>
                    <div className="flex mt-1">
                      <Input value={generatedUrl} readOnly className="flex-1 rounded-r-none" />
                      <Button 
                        type="button" 
                        onClick={copyToClipboard} 
                        className="rounded-l-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
