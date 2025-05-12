import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarView } from "@/components/ui/calendar-view";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarCheck, Users, ChevronLeft, ChevronRight, 
  Banknote, Clock, Copy, Bell, TriangleAlert, UserCheck
} from "lucide-react";

// Example services
const services = [
  { id: "1", name: "Corte de Cabelo", price: 50 },
  { id: "2", name: "Barba", price: 35 },
  { id: "3", name: "Corte + Barba", price: 75 },
  { id: "4", name: "Coloração", price: 120 },
  { id: "5", name: "Sobrancelha", price: 25 },
];

// Example clients
const clients = [
  { id: "1", name: "Carlos Mendes" },
  { id: "2", name: "Ana Souza" },
  { id: "3", name: "Pedro Alves" },
  { id: "4", name: "Maria Costa" },
  { id: "5", name: "Lucas Ferreira" },
];

// Example appointments for the calendar
const exampleAppointments = {
  [format(new Date(), "yyyy-MM-dd")]: [
    { id: "1", clientName: "Carlos", time: "09:00" },
    { id: "2", clientName: "Ana", time: "10:30" },
    { id: "3", clientName: "Pedro", time: "13:15" },
    { id: "4", clientName: "Maria", time: "15:00" },
  ],
  [format(addDays(new Date(), 1), "yyyy-MM-dd")]: [
    { id: "5", clientName: "Juliana", time: "11:00" },
    { id: "6", clientName: "Roberto", time: "14:30" },
  ],
  [format(addDays(new Date(), 2), "yyyy-MM-dd")]: [
    { id: "7", clientName: "André", time: "09:30" },
    { id: "8", clientName: "Fernanda", time: "13:00" },
    { id: "9", clientName: "Lucas", time: "16:45" },
  ],
};

export default function OwnerDashboard() {
  const { toast } = useToast();
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [businessLink, setBusinessLink] = useState("https://agendahub.com/barbearia-silva");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(businessLink);
    toast({
      title: "Link copiado!",
      description: "URL copiada para a área de transferência.",
    });
  };

  const handleNewAppointment = (data: any) => {
    toast({
      title: "Agendamento criado",
      description: `Agendamento para ${data.serviceId} criado com sucesso.`,
    });
  };

  return (
    <DashboardLayout role="owner">
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 md:hidden">Dashboard do Estabelecimento</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  <p className="text-2xl font-bold">124</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 mr-4">
                  <Banknote className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faturamento (Mensal)</p>
                  <p className="text-2xl font-bold">R$ 4.850</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos Restantes</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">23</p>
                    <span className="ml-2 text-xs text-muted-foreground">de 50</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "46%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Agenda do Dia</CardTitle>
                <div className="flex space-x-2 items-center">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Horário</th>
                        <th className="text-left py-3 px-2">Cliente</th>
                        <th className="text-left py-3 px-2">Serviço</th>
                        <th className="text-left py-3 px-2">Valor</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">09:00</td>
                        <td className="py-3 px-2">Carlos Mendes</td>
                        <td className="py-3 px-2">Corte de Cabelo</td>
                        <td className="py-3 px-2">R$ 50,00</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Confirmado</span>
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">10:30</td>
                        <td className="py-3 px-2">Ana Souza</td>
                        <td className="py-3 px-2">Manicure</td>
                        <td className="py-3 px-2">R$ 45,00</td>
                        <td className="py-3 px-2">
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">Aguardando</span>
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">13:15</td>
                        <td className="py-3 px-2">Pedro Alves</td>
                        <td className="py-3 px-2">Barba</td>
                        <td className="py-3 px-2">R$ 35,00</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Confirmado</span>
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 text-center">
                  <Button 
                    onClick={() => setAppointmentFormOpen(true)}
                    className="bg-primary text-primary-foreground"
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" /> Novo Agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <CalendarView 
              appointments={exampleAppointments}
              onDayClick={(date) => {
                setSelectedDate(date);
                setAppointmentFormOpen(true);
              }}
              onAppointmentClick={(appointment) => {
                toast({
                  title: "Agendamento selecionado",
                  description: `Agendamento de ${appointment.clientName} às ${appointment.time}`,
                });
              }}
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                  <div className="rounded-full bg-yellow-200 dark:bg-yellow-800 p-2 mr-3">
                    <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ana Souza aguarda confirmação</p>
                    <p className="text-xs text-muted-foreground">Manicure - Hoje, 10:30</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <div className="rounded-full bg-red-200 dark:bg-red-800 p-2 mr-3">
                    <TriangleAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Paulo Lima cancelou o agendamento</p>
                    <p className="text-xs text-muted-foreground">Corte e Barba - Amanhã, 14:00</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="rounded-full bg-blue-200 dark:bg-blue-800 p-2 mr-3">
                    <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo cliente cadastrado</p>
                    <p className="text-xs text-muted-foreground">Fernanda Gomes - Há 2 horas</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full">Ver todas</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Plano</CardTitle>
                <CardDescription>
                  Informações do seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">Agendamentos utilizados</span>
                    <div className="text-2xl font-bold">23/50</div>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full mb-4">
                    <div className="bg-primary h-full rounded-full" style={{ width: "46%" }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Plano gratuito limitado a 50 agendamentos. Faça upgrade para recursos ilimitados.
                  </p>
                  <Button className="w-full">
                    Fazer Upgrade para Premium<br />
                    <span className="text-xs font-normal">Apenas R$ 49,90/mês</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Link para Clientes</CardTitle>
                <CardDescription>
                  Compartilhe o link para que seus clientes possam se cadastrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex">
                  <Input 
                    value={businessLink} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button 
                    onClick={handleCopyLink} 
                    className="rounded-l-none"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <AppointmentForm 
          open={appointmentFormOpen}
          onOpenChange={setAppointmentFormOpen}
          onSubmit={handleNewAppointment}
          initialDate={selectedDate}
          services={services}
          clients={clients}
          isBusinessOwner={true}
        />
      </div>
    </DashboardLayout>
  );
}

// Helper component for Check and X buttons
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
