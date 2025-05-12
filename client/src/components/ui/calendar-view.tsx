import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  clientName: string;
  time: string;
  service: string;
}

interface CalendarViewProps {
  appointments: Record<string, Appointment[]>;
  onDayClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function CalendarView({ appointments, onDayClick, onAppointmentClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  
  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Calendário Semanal</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium text-sm">
            {format(days[0], "dd MMM", { locale: ptBR })} - {format(days[6], "dd MMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {dayNames.map((day, i) => (
            <div key={i} className="text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayAppointments = appointments[dateStr] || [];
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "border rounded-md calendar-day p-1 cursor-pointer",
                  isCurrentDay && "bg-primary/10"
                )}
                onClick={() => onDayClick?.(day)}
              >
                <div className="text-xs text-right mb-1">{format(day, "dd")}</div>
                {dayAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="appointment-item bg-primary/10 hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(appointment);
                    }}
                  >
                    {appointment.time} - {appointment.clientName}
                  </div>
                ))}
                {dayAppointments.length === 0 && (
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    Sem agendamentos
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
