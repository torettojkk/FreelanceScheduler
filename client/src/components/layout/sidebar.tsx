import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { 
  LayoutDashboard, Users, Calendar, FileText, Bell, 
  Settings, LogOut, Building, Store, CreditCard, 
  BarChart, Plus, History, UserCircle 
} from "lucide-react";

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleSpecificLinks = () => {
    switch (role) {
      case "admin":
        return (
          <>
            <SidebarHeading>Admin</SidebarHeading>
            <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} active={location === "/admin"}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/admin/establishments" icon={<Building size={18} />} active={location.startsWith("/admin/establishments")}>
              Estabelecimentos
            </SidebarLink>
            <SidebarLink href="/admin/users" icon={<Users size={18} />} active={location.startsWith("/admin/users")}>
              Usuários
            </SidebarLink>
            <SidebarLink href="/admin/reports" icon={<BarChart size={18} />} active={location.startsWith("/admin/reports")}>
              Relatórios
            </SidebarLink>
            <SidebarLink href="/admin/notifications" icon={<Bell size={18} />} active={location.startsWith("/admin/notifications")}>
              Notificações
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 rounded-full">7</span>
            </SidebarLink>
          </>
        );
      case "owner":
        return (
          <>
            <SidebarHeading>Estabelecimento</SidebarHeading>
            <SidebarLink href="/owner" icon={<LayoutDashboard size={18} />} active={location === "/owner"}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/owner/calendar" icon={<Calendar size={18} />} active={location.startsWith("/owner/calendar")}>
              Agenda
            </SidebarLink>
            <SidebarLink href="/owner/clients" icon={<Users size={18} />} active={location.startsWith("/owner/clients")}>
              Clientes
            </SidebarLink>
            <SidebarLink href="/owner/financial" icon={<CreditCard size={18} />} active={location.startsWith("/owner/financial")}>
              Financeiro
            </SidebarLink>
            <SidebarLink href="/owner/reports" icon={<BarChart size={18} />} active={location.startsWith("/owner/reports")}>
              Relatórios
            </SidebarLink>
            <SidebarLink href="/owner/notifications" icon={<Bell size={18} />} active={location.startsWith("/owner/notifications")}>
              Notificações
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 rounded-full">3</span>
            </SidebarLink>
            <SidebarLink href="/owner/business" icon={<Store size={18} />} active={location.startsWith("/owner/business")}>
              Meu Negócio
            </SidebarLink>
          </>
        );
      case "client":
        return (
          <>
            <SidebarHeading>Cliente</SidebarHeading>
            <SidebarLink href="/client" icon={<LayoutDashboard size={18} />} active={location === "/client"}>
              Meus Agendamentos
            </SidebarLink>
            <SidebarLink href="/client/new-appointment" icon={<Plus size={18} />} active={location.startsWith("/client/new-appointment")}>
              Novo Agendamento
            </SidebarLink>
            <SidebarLink href="/client/history" icon={<History size={18} />} active={location.startsWith("/client/history")}>
              Histórico
            </SidebarLink>
            <SidebarLink href="/client/notifications" icon={<Bell size={18} />} active={location.startsWith("/client/notifications")}>
              Notificações
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 rounded-full">2</span>
            </SidebarLink>
            <SidebarLink href="/client/establishments" icon={<Building size={18} />} active={location.startsWith("/client/establishments")}>
              Estabelecimentos
            </SidebarLink>
            <SidebarLink href="/client/profile" icon={<UserCircle size={18} />} active={location.startsWith("/client/profile")}>
              Perfil
            </SidebarLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-64 bg-card border-r h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">AgendaHub</span>
          </a>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {getRoleSpecificLinks()}
      </div>
      
      <div className="p-4 border-t">
        <SidebarLink href="/settings" icon={<Settings size={18} />} active={location.startsWith("/settings")}>
          Configurações
        </SidebarLink>
        <Button
          variant="ghost" 
          className="w-full justify-start pl-3 font-normal" 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut size={18} className="mr-2" />
          {logoutMutation.isPending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </div>
  );
}

interface SidebarHeadingProps {
  children: React.ReactNode;
}

function SidebarHeading({ children }: SidebarHeadingProps) {
  return (
    <h2 className="text-xs uppercase font-semibold text-muted-foreground px-3 mb-2">
      {children}
    </h2>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

function SidebarLink({ href, icon, children, active }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
      )}>
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
}
