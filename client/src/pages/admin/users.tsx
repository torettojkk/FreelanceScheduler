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
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn, apiRequest } from "@/lib/queryClient";
import { User, UserRole } from "@shared/schema";
import { 
  User as UserIcon, Shield, Mail, Calendar, Edit, Trash2, Eye, Search, RefreshCcw, PlusCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [newUserOpen, setNewUserOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("client");
  
  // Fetch users
  const { data: users, isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      setNewUserOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As informações foram atualizadas.",
      });
      setEditUserId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário removido com sucesso!",
        description: "O usuário foi removido do sistema.",
      });
      setDeleteUserId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle user creation
  const handleCreateUser = () => {
    if (!formName || !formEmail || !formPassword || !formRole) {
      toast({
        title: "Erro ao cadastrar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    createUserMutation.mutate({
      name: formName,
      email: formEmail,
      password: formPassword,
      role: formRole,
    });
  };
  
  // Handle user update
  const handleUpdateUser = () => {
    if (!formName || !formEmail || !formRole) {
      toast({
        title: "Erro ao atualizar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (editUserId) {
      const updateData: any = {
        name: formName,
        email: formEmail,
        role: formRole,
      };
      
      // Only include password if it's set
      if (formPassword) {
        updateData.password = formPassword;
      }
      
      updateUserMutation.mutate({
        id: editUserId,
        data: updateData,
      });
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };
  
  // Setup edit user form
  const setupEditForm = (user: User) => {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(""); // Don't set the password for editing
    setFormRole(user.role);
    setEditUserId(user.id);
  };
  
  // Reset form fields
  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("client");
  };
  
  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      roleFilter === "all" || 
      user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];
  
  // Get view details user
  const viewUser = viewDetailsId ? 
    users?.find(u => u.id === viewDetailsId) : null;
  
  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "admin": return "Administrador";
      case "owner": return "Estabelecimento";
      case "client": return "Cliente";
      default: return role;
    }
  };
  
  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários cadastrados no sistema
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setNewUserOpen(true)}
              className="bg-primary text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
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
              placeholder="Buscar usuários..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="owner">Estabelecimentos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuários encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando usuários...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-6 text-destructive">
                <p>Erro ao carregar usuários.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Tentar novamente
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === "admin" ? "destructive" :
                            user.role === "owner" ? "default" : "secondary"
                          }>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR }) : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewDetailsId(user.id)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setupEditForm(user)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteUserId(user.id)}
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
      
      {/* View User Details Dialog */}
      <Dialog open={viewDetailsId !== null} onOpenChange={(open) => !open && setViewDetailsId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>Informações detalhadas sobre o usuário</DialogDescription>
          </DialogHeader>
          
          {viewUser && (
            <div className="space-y-4 mt-4">
              <div className="rounded-md p-4 bg-secondary/10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <UserIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{viewUser.name}</h2>
                    <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Usuário</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{getRoleDisplayName(viewUser.role)}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Cadastro</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {viewUser.createdAt
                        ? format(new Date(viewUser.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : "Data não disponível"}
                    </span>
                  </div>
                </div>
              </div>
              
              {viewUser.businessId && (
                <div>
                  <Label className="text-xs text-muted-foreground">Estabelecimento Vinculado</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Store className="h-4 w-4 text-primary" />
                    <span>ID do Estabelecimento: {viewUser.businessId}</span>
                  </div>
                </div>
              )}
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
                if (viewUser) {
                  setupEditForm(viewUser);
                  setViewDetailsId(null);
                }
              }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New User Dialog */}
      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            
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
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuário *</Label>
              <Select value={formRole} onValueChange={(value) => setFormRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Estabelecimento</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Criando...
                </>
              ) : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserId !== null} onOpenChange={(open) => !open && setEditUserId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            
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
              <Label htmlFor="edit-password">Nova Senha (deixe em branco para manter a atual)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Nova senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Tipo de Usuário *</Label>
              <Select value={formRole} onValueChange={(value) => setFormRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Estabelecimento</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Atualizando...
                </>
              ) : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Excluindo...
                </>
              ) : "Excluir Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}