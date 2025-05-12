import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, Store, Tag, Check, X, Edit } from "lucide-react";

export interface Appointment {
  id: string;
  service: string;
  businessName?: string;
  date: Date;
  price: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
}

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  
  const { id, service, businessName, date, price, status } = appointment;
  
  const isFuture = isAfter(date, new Date());
  
  const getStatusBadge = () => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-500">Confirmado</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500">Aguardando</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500">Cancelado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500">Concluído</Badge>;
    }
  };
  
  return (
    <>
      <Card className="bg-card hover:bg-muted/50 transition-colors">
        <CardContent className="p-5">
          <div className="flex">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-white">
              <CalendarClock className="h-8 w-8" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium">{service}</h3>
                <div>
                  {getStatusBadge()}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {businessName && (
                  <div className="flex items-center mb-1">
                    <Store className="h-4 w-4 mr-1.5" />
                    <span>{businessName}</span>
                  </div>
                )}
                <div className="flex items-center mb-1">
                  <CalendarClock className="h-4 w-4 mr-1.5" />
                  <span>
                    {format(date, "PPP", { locale: ptBR })} às {format(date, "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1.5" />
                  <span>R$ {price.toFixed(2)}</span>
                </div>
              </div>
              
              {isFuture && (status === "pending" || status === "confirmed") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {status === "pending" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Confirmar
                    </Button>
                  )}
                  
                  <Button 
                    size="sm"
                    variant="secondary"
                    onClick={() => onReschedule(id)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Reagendar
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => setCancelOpen(true)}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja confirmar este agendamento? 
              Você será notificado sobre este compromisso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onConfirm(id)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Cancel Dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? 
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onCancel(id)}
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
