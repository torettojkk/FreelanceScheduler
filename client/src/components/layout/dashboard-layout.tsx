import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  const userName = user?.name || "Usuário";
  
  let roleTitle = "";
  if (role === "admin") roleTitle = "Administrador";
  else if (role === "owner") roleTitle = "Estabelecimento";
  else if (role === "client") roleTitle = "Cliente";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar role={role} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0" onInteractOutside={() => setIsMobileOpen(false)}>
              <Sidebar role={role} />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-primary">AgendaHub</h1>
          </div>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="hidden md:flex items-center justify-between bg-card border-b p-4">
          <div>
            <h1 className="text-2xl font-bold">Painel do {roleTitle}</h1>
            <p className="text-muted-foreground">Bem-vindo(a), {userName}</p>
          </div>
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
