import { useState } from "react";
import { useListAppointments, useCreateAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, Video, MapPin, User, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  advisorId: z.coerce.number().min(1),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.string().min(1, "Type is required"),
  notes: z.string().optional(),
});

export default function Appointments() {
  const { data: appointments, isLoading } = useListAppointments();
  const createMutation = useCreateAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "Kyle User",
      clientEmail: "kyle@example.com",
      advisorId: 1, // Defaulting to Lance
      date: "",
      time: "",
      type: "Review",
      notes: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast({
            title: "Appointment booked",
            description: "Your appointment has been successfully scheduled.",
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your meetings and consultations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book an Appointment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                          <SelectItem value="Review">Annual Review</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any specific topics to discuss?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : appointments?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No appointments scheduled</p>
          </div>
        ) : (
          appointments?.map((apt) => (
            <Card key={apt.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border-border">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-serif">{apt.type}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 text-primary font-medium">
                    <User className="h-3.5 w-3.5" />
                    {apt.advisorName}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(apt.status)}>
                  {apt.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 mt-2">
                <div className="flex flex-col gap-2.5 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(apt.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>Virtual Meeting</span>
                  </div>
                </div>
                {apt.notes && (
                  <p className="mt-4 text-sm text-muted-foreground italic border-t pt-2 border-border/50">
                    "{apt.notes}"
                  </p>
                )}
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-border py-3">
                <Button variant="outline" className="w-full text-xs h-8" disabled={apt.status === 'completed' || apt.status === 'cancelled'}>
                  Reschedule
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
