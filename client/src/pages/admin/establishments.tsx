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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn, apiRequest } from "@/lib/queryClient";
import { Business } from "@shared/schema";
import { 
  Building, MapPin, Phone, Mail, Calendar, Edit, Trash2, Eye, 
  Search, RefreshCcw, PlusCircle, Check, X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminEstablishments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
  const [formStatus, setFormStatus] = useState("active");
  const [formIsPremium, setFormIsPremium] = useState(false);
  
  // Fetch businesses
  const { data: establishments, isLoading, isError, refetch } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Create business mutation
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
  
  // Update business mutation
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
  
  // Delete business mutation
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
  
  // Handle business creation
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
  
  // Handle business update
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
          status: formStatus,
          isPremium: formIsPremium,
        },
      });
    }
  };
  
  // Handle business deletion
  const handleDeleteEstablishment = () => {
    if (deleteEstablishmentId) {
      deleteEstablishmentMutation.mutate(deleteEstablishmentId);
    }
  };
  
  // Setup edit business form
  const setupEditForm = (establishment: Business) => {
    setFormName(establishment.name);
    setFormOwnerName(establishment.ownerName);
    setFormEmail(establishment.email);
    setFormPhone(establishment.phone || "");
    setFormType(establishment.type);
    setFormAddress(establishment.address || "");
    setFormDescription(establishment.description || "");
    setFormStatus(establishment.status || "active");
    setFormIsPremium(establishment.isPremium || false);
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
    setFormStatus("active");
    setFormIsPremium(false);
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
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "destructive";
      case "pending": return "warning";
      default: return "secondary";
    }
  };
  
  // Get status display name
  const getStatusDisplayName = (status: string | null) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      case "pending": return "Pendente";
      default: return "Desconhecido";
    }
  };
  
  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Estabelecimentos</h1>
            <p className="text-muted-foreground">
              Gerencie os estabelecimentos cadastrados na plataforma
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
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
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
                      <TableHead>Responsável</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Premium</TableHead>
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
                          <Badge variant={getStatusBadgeVariant(establishment.status) as any}>
                            {getStatusDisplayName(establishment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {establishment.isPremium ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Estabelecimento</DialogTitle>
            <DialogDescription>Informações detalhadas sobre o estabelecimento</DialogDescription>
          </DialogHeader>
          
          {viewEstablishment && (
            <div className="space-y-4 mt-4">
              <div className="rounded-md p-4 bg-secondary/10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Building className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{viewEstablishment.name}</h2>
                    <Badge variant={getStatusBadgeVariant(viewEstablishment.status) as any}>
                      {getStatusDisplayName(viewEstablishment.status)}
                    </Badge>
                    {viewEstablishment.isPremium && (
                      <Badge variant="default" className="ml-2">Premium</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Responsável</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{viewEstablishment.ownerName}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{viewEstablishment.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Contato</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{viewEstablishment.email}</span>
                  </div>
                  {viewEstablishment.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{viewEstablishment.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {viewEstablishment.address && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Endereço</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{viewEstablishment.address}</span>
                  </div>
                </div>
              )}
              
              {viewEstablishment.description && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{viewEstablishment.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Cadastro</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {viewEstablishment.createdAt
                        ? format(new Date(viewEstablishment.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : "Data não disponível"}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Agendamentos</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{viewEstablishment.appointmentCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDetailsId(null)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                if (viewEstablishment) {
                  setupEditForm(viewEstablishment);
                  setViewDetailsId(null);
                }
              }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Establishment Dialog */}
      <Dialog open={newEstablishmentOpen} onOpenChange={setNewEstablishmentOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Estabelecimento</DialogTitle>
            <DialogDescription>
              Cadastre um novo estabelecimento na plataforma
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do estabelecimento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Input
                  id="type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  placeholder="Ex: Salão de Beleza, Barbearia"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nome do Responsável *</Label>
              <Input
                id="ownerName"
                value={formOwnerName}
                onChange={(e) => setFormOwnerName(e.target.value)}
                placeholder="Nome completo do responsável"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição do estabelecimento"
                rows={3}
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Estabelecimento</DialogTitle>
            <DialogDescription>
              Atualize as informações do estabelecimento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo *</Label>
                <Input
                  id="edit-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-ownerName">Nome do Responsável *</Label>
              <Input
                id="edit-ownerName"
                value={formOwnerName}
                onChange={(e) => setFormOwnerName(e.target.value)}
              />
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
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-start space-x-2 pt-8">
                <Switch 
                  id="edit-premium" 
                  checked={formIsPremium}
                  onCheckedChange={setFormIsPremium}
                />
                <Label htmlFor="edit-premium">Conta Premium</Label>
              </div>
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