import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn, apiRequest } from "@/lib/queryClient";
import { Business } from "@shared/schema";
import { 
  Building, Store, Users, Calendar, MoreHorizontal, Edit, Trash2, Eye, Search, RefreshCcw, PlusCircle
} from "lucide-react";

export default function AdminEstablishments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);
  const [editEstablishmentId, setEditEstablishmentId] = useState<number | null>(null);
  const [deleteEstablishmentId, setDeleteEstablishmentId] = useState<number | null>(null);
  const [newEstablishmentOpen, setNewEstablishmentOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  // Fetch establishments
  const { data: establishments, isLoading, isError, refetch } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Create establishment mutation
  const createEstablishmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/businesses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Estabelecimento cadastrado com sucesso!",
        description: "O novo estabelecimento foi adicionado ao sistema.",
      });
      setNewEstablishmentOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar estabelecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update establishment mutation
  const updateEstablishmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/businesses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Estabelecimento atualizado com sucesso!",
        description: "As informações foram atualizadas.",
      });
      setEditEstablishmentId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar estabelecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete establishment mutation
  const deleteEstablishmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/businesses/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Estabelecimento removido com sucesso!",
        description: "O estabelecimento foi removido do sistema.",
      });
      setDeleteEstablishmentId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover estabelecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle establishment creation
  const handleCreateEstablishment = () => {
    if (!formName || !formOwnerName || !formEmail || !formType) {
      toast({
        title: "Erro ao cadastrar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    createEstablishmentMutation.mutate({
      name: formName,
      ownerName: formOwnerName,
      email: formEmail,
      phone: formPhone,
      type: formType,
      address: formAddress,
      description: formDescription,
    });
  };
  
  // Handle establishment update
  const handleUpdateEstablishment = () => {
    if (!formName || !formOwnerName || !formEmail || !formType) {
      toast({
        title: "Erro ao atualizar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (editEstablishmentId) {
      updateEstablishmentMutation.mutate({
        id: editEstablishmentId,
        data: {
          name: formName,
          ownerName: formOwnerName,
          email: formEmail,
          phone: formPhone,
          type: formType,
          address: formAddress,
          description: formDescription,
        },
      });
    }
  };
  
  // Handle establishment deletion
  const handleDeleteEstablishment = () => {
    if (deleteEstablishmentId) {
      deleteEstablishmentMutation.mutate(deleteEstablishmentId);
    }
  };
  
  // Setup edit establishment form
  const setupEditForm = (establishment: Business) => {
    setFormName(establishment.name);
    setFormOwnerName(establishment.ownerName);
    setFormEmail(establishment.email);
    setFormPhone(establishment.phone || "");
    setFormType(establishment.type);
    setFormAddress(establishment.address || "");
    setFormDescription(establishment.description || "");
    setEditEstablishmentId(establishment.id);
  };
  
  // Reset form fields
  const resetForm = () => {
    setFormName("");
    setFormOwnerName("");
    setFormEmail("");
    setFormPhone("");
    setFormType("");
    setFormAddress("");
    setFormDescription("");
  };
  
  // Copy URL to clipboard
  const copyToClipboard = (slug: string) => {
    const url = `https://agendahub.com/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "Link copiado para a área de transferência.",
    });
  };
  
  // Filter establishments
  const filteredEstablishments = establishments?.filter((establishment) => {
    const matchesSearch = 
      establishment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      establishment.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      establishment.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      establishment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Get view details establishment
  const viewEstablishment = viewDetailsId ? 
    establishments?.find(e => e.id === viewDetailsId) : null;
  
  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Estabelecimentos</h1>
            <p className="text-muted-foreground">
              Gerencie os estabelecimentos cadastrados no sistema
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setNewEstablishmentOpen(true)}
              className="bg-primary text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Estabelecimento
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estabelecimentos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Estabelecimentos</CardTitle>
            <CardDescription>
              {filteredEstablishments.length} estabelecimentos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando estabelecimentos...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-6 text-destructive">
                <p>Erro ao carregar estabelecimentos.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Tentar novamente
                </Button>
              </div>
            ) : filteredEstablishments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Nenhum estabelecimento encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agendamentos</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEstablishments.map((establishment) => (
                      <TableRow key={establishment.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{establishment.name}</TableCell>
                        <TableCell>{establishment.ownerName}</TableCell>
                        <TableCell>{establishment.type}</TableCell>
                        <TableCell>
                          <Badge variant={
                            establishment.status === "active" ? "default" :
                            establishment.status === "pending" ? "secondary" : "outline"
                          }>
                            {establishment.status === "active" ? "Ativo" :
                             establishment.status === "pending" ? "Pendente" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{establishment.appointmentCount || 0}</TableCell>
                        <TableCell>
                          {establishment.isPremium ? (
                            <Badge variant="default" className="bg-amber-500">Premium</Badge>
                          ) : (
                            <Badge variant="outline">Gratuito</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewDetailsId(establishment.id)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setupEditForm(establishment)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteEstablishmentId(establishment.id)}
                              className="text-destructive"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* View Establishment Details Dialog */}
      <Dialog open={viewDetailsId !== null} onOpenChange={(open) => !open && setViewDetailsId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Estabelecimento</DialogTitle>
            <DialogDescription>Informações detalhadas sobre o estabelecimento</DialogDescription>
          </DialogHeader>
          
          {viewEstablishment && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <p className="font-medium">{viewEstablishment.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Proprietário</Label>
                    <p className="font-medium">{viewEstablishment.ownerName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{viewEstablishment.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{viewEstablishment.phone || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{viewEstablishment.type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="font-medium">{
                      viewEstablishment.status === "active" ? "Ativo" :
                      viewEstablishment.status === "pending" ? "Pendente" : "Inativo"
                    }</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Endereço</Label>
                  <p className="font-medium">{viewEstablishment.address || "Não informado"}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{viewEstablishment.description || "Não informada"}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-secondary/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <Label>Agendamentos</Label>
                    </div>
                    <p className="text-2xl font-bold mt-1">{viewEstablishment.appointmentCount || 0}</p>
                    <p className="text-xs text-muted-foreground">{viewEstablishment.isPremium ? "Ilimitado" : `${viewEstablishment.appointmentCount || 0}/50 (Plano gratuito)`}</p>
                  </div>
                  
                  <div className="p-4 rounded-md bg-secondary/10">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label>Clientes</Label>
                    </div>
                    <p className="text-2xl font-bold mt-1">-</p>
                    <p className="text-xs text-muted-foreground">Estatística em desenvolvimento</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <Label>Plano de Assinatura</Label>
                  </div>
                  <p className="text-xl font-bold mt-1">{viewEstablishment.isPremium ? "Premium" : "Gratuito"}</p>
                  {!viewEstablishment.isPremium && (
                    <div className="mt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${Math.min(((viewEstablishment.appointmentCount || 0) / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {viewEstablishment.appointmentCount || 0}/50 agendamentos utilizados
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground">URL para cadastro de clientes</Label>
                  <div className="flex mt-1">
                    <Input 
                      value={`https://agendahub.com/${viewEstablishment.urlSlug}`}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={() => copyToClipboard(viewEstablishment.urlSlug)} 
                      className="rounded-l-none"
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Compartilhe esta URL com os clientes para que eles possam se cadastrar no estabelecimento.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDetailsId(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Establishment Dialog */}
      <Dialog open={newEstablishmentOpen} onOpenChange={setNewEstablishmentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Estabelecimento</DialogTitle>
            <DialogDescription>
              Cadastre um novo estabelecimento no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Estabelecimento *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Barbearia Silva"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome do Proprietário *</Label>
                <Input
                  id="ownerName"
                  value={formOwnerName}
                  onChange={(e) => setFormOwnerName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ex: contato@barbearia.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Estabelecimento *</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barber">Barbearia</SelectItem>
                  <SelectItem value="salon">Salão de Beleza</SelectItem>
                  <SelectItem value="clinic">Clínica</SelectItem>
                  <SelectItem value="gym">Academia</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="mechanic">Oficina Mecânica</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ex: A melhor barbearia da cidade"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleCreateEstablishment}
              disabled={createEstablishmentMutation.isPending}
            >
              {createEstablishmentMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Criando...
                </>
              ) : "Criar Estabelecimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Establishment Dialog */}
      <Dialog open={editEstablishmentId !== null} onOpenChange={(open) => !open && setEditEstablishmentId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Estabelecimento</DialogTitle>
            <DialogDescription>
              Atualize as informações do estabelecimento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Estabelecimento *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName">Nome do Proprietário *</Label>
                <Input
                  id="edit-ownerName"
                  value={formOwnerName}
                  onChange={(e) => setFormOwnerName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de Estabelecimento *</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barber">Barbearia</SelectItem>
                  <SelectItem value="salon">Salão de Beleza</SelectItem>
                  <SelectItem value="clinic">Clínica</SelectItem>
                  <SelectItem value="gym">Academia</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="mechanic">Oficina Mecânica</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateEstablishment}
              disabled={updateEstablishmentMutation.isPending}
            >
              {updateEstablishmentMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Atualizando...
                </>
              ) : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Establishment Dialog */}
      <Dialog open={deleteEstablishmentId !== null} onOpenChange={(open) => !open && setDeleteEstablishmentId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Estabelecimento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este estabelecimento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleDeleteEstablishment}
              disabled={deleteEstablishmentMutation.isPending}
            >
              {deleteEstablishmentMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Excluindo...
                </>
              ) : "Excluir Estabelecimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}