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
import { AppointmentCard, Appointment } from "@/components/appointments/appointment-card";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { useToast } from "@/hooks/use-toast";
import { addDays, addHours } from "date-fns";
import { Download, Bell, Info, Star, Scissors, Bath, Car } from "lucide-react";

// Example services for the appointment form
const services = [
  { id: "1", name: "Corte de Cabelo", price: 50 },
  { id: "2", name: "Barba", price: 35 },
  { id: "3", name: "Manicure", price: 45 },
  { id: "4", name: "Pedicure", price: 50 },
  { id: "5", name: "Coloração", price: 120 },
];

// Example appointments for the client
const upcomingAppointments: Appointment[] = [
  {
    id: "1",
    service: "Corte de Cabelo",
    businessName: "Barbearia Silva",
    date: addDays(new Date(), 1),
    price: 50,
    status: "confirmed",
  },
  {
    id: "2",
    service: "Manicure Completa",
    businessName: "Estúdio Beleza Pura",
    date: addHours(addDays(new Date(), 2), 2),
    price: 45,
    status: "pending",
  },
];

// Example past appointments
const pastAppointments = [
  {
    date: "15/05/2023",
    service: "Corte de Cabelo",
    business: "Barbearia Silva",
    price: "R$ 50,00",
    status: "Concluído",
  },
  {
    date: "10/05/2023",
    service: "Manicure",
    business: "Estúdio Beleza Pura",
    price: "R$ 45,00",
    status: "Concluído",
  },
  {
    date: "05/05/2023",
    service: "Barba",
    business: "Barbearia Silva",
    price: "R$ 35,00",
    status: "Concluído",
  },
  {
    date: "28/04/2023",
    service: "Troca de Óleo",
    business: "Auto Mecânica Rapida",
    price: "R$ 120,00",
    status: "Concluído",
  },
  {
    date: "20/04/2023",
    service: "Corte e Barba",
    business: "Barbearia Silva",
    price: "R$ 75,00",
    status: "Cancelado",
  },
];

export default function ClientDashboard() {
  const { toast } = useToast();
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  
  const handleConfirmAppointment = (id: string) => {
    toast({
      title: "Agendamento confirmado",
      description: "Você receberá uma notificação de lembrete próximo da data.",
    });
  };
  
  const handleCancelAppointment = (id: string) => {
    toast({
      title: "Agendamento cancelado",
      description: "O cancelamento foi processado com sucesso.",
      variant: "destructive",
    });
  };
  
  const handleRescheduleAppointment = (id: string) => {
    setAppointmentFormOpen(true);
    toast({
      title: "Reagendar agendamento",
      description: "Selecione uma nova data e horário.",
    });
  };
  
  const handleNewAppointment = (data: any) => {
    toast({
      title: "Agendamento criado",
      description: `Agendamento criado com sucesso para ${data.date} às ${data.time}.`,
    });
  };
  
  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Seu histórico está sendo exportado em PDF.",
    });
  };

  return (
    <DashboardLayout role="client">
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 md:hidden">Meus Agendamentos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>
                  Agendamentos confirmados e pendentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onConfirm={handleConfirmAppointment}
                      onCancel={handleCancelAppointment}
                      onReschedule={handleRescheduleAppointment}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Você não possui agendamentos futuros.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setAppointmentFormOpen(true)}
                >
                  Agendar Novo Serviço
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Histórico de Serviços</CardTitle>
                  <CardDescription>
                    Registro de seus serviços anteriores
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Data</th>
                        <th className="text-left py-3 px-2">Serviço</th>
                        <th className="text-left py-3 px-2">Estabelecimento</th>
                        <th className="text-left py-3 px-2">Valor</th>
                        <th className="text-left py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastAppointments.map((app, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">{app.date}</td>
                          <td className="py-3 px-2">{app.service}</td>
                          <td className="py-3 px-2">{app.business}</td>
                          <td className="py-3 px-2">{app.price}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              app.status === "Concluído" 
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
                    <p className="text-sm font-medium">Confirme seu agendamento</p>
                    <p className="text-xs text-muted-foreground">Manicure - Amanhã, 10:00</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="rounded-full bg-blue-200 dark:bg-blue-800 p-2 mr-3">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lembrete de agendamento</p>
                    <p className="text-xs text-muted-foreground">Corte de Cabelo - Amanhã, 15:30</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full">Ver todas</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estabelecimentos Favoritos</CardTitle>
                <CardDescription>
                  Agende facilmente em seus locais preferidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Barbearia Silva</h3>
                    <p className="text-xs text-muted-foreground">Corte, barba, tratamentos</p>
                  </div>
                  <Button className="ml-auto" size="sm">
                    Agendar
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <Bath className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Estúdio Beleza Pura</h3>
                    <p className="text-xs text-muted-foreground">Manicure, pedicure, cabelo</p>
                  </div>
                  <Button className="ml-auto" size="sm">
                    Agendar
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Auto Mecânica Rapida</h3>
                    <p className="text-xs text-muted-foreground">Manutenção, troca de óleo</p>
                  </div>
                  <Button className="ml-auto" size="sm">
                    Agendar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Meus Benefícios</CardTitle>
                <CardDescription>
                  Programas de fidelidade e vantagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-md bg-gradient-to-r from-primary to-secondary text-white">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-bold text-lg">Barbearia Silva</h3>
                      <p className="text-sm opacity-80">Programa de Fidelidade</p>
                    </div>
                    <div className="text-sm font-bold bg-white bg-opacity-20 rounded-full px-3 py-1">7/10</div>
                  </div>
                  <div className="h-2 bg-white bg-opacity-20 rounded-full mb-2">
                    <div className="bg-white h-full rounded-full" style={{ width: "70%" }}></div>
                  </div>
                  <p className="text-sm opacity-80">Mais 3 cortes para ganhar um serviço gratuito!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <AppointmentForm 
          open={appointmentFormOpen}
          onOpenChange={setAppointmentFormOpen}
          onSubmit={handleNewAppointment}
          services={services}
          isBusinessOwner={false}
        />
      </div>
    </DashboardLayout>
  );
}
