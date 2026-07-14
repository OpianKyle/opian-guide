import { useState } from "react";
import { 
  useAdminListAppointments, 
  useAdminCreateAppointment, 
  useAdminUpdateAppointment, 
  useAdminDeleteAppointment,
  getAdminListAppointmentsQueryKey,
  useAdminListAdvisors
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Plus, Edit2, Trash2, X, Clock, User, Video, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Appointments() {
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useAdminListAppointments();
  const { data: advisors } = useAdminListAdvisors();
  
  const createAppointment = useAdminCreateAppointment();
  const updateAppointment = useAdminUpdateAppointment();
  const deleteAppointment = useAdminDeleteAppointment();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: "", clientEmail: "", advisorId: "", date: "", time: "", type: "video", status: "scheduled", notes: ""
  });

  const resetForm = () => {
    setFormData({ clientName: "", clientEmail: "", advisorId: "", date: "", time: "", type: "video", status: "scheduled", notes: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (appointment: any) => {
    setFormData({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      advisorId: appointment.advisorId.toString(),
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || ""
    });
    setEditingId(appointment.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      advisorId: parseInt(formData.advisorId),
      date: formData.date,
      time: formData.time,
      type: formData.type,
      notes: formData.notes,
      ...(editingId ? { status: formData.status } : {})
    };

    if (editingId) {
      updateAppointment.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAppointmentsQueryKey() });
          resetForm();
        }
      });
    } else {
      createAppointment.mutate({ data: payload as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAppointmentsQueryKey() });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to cancel and delete this appointment?")) {
      deleteAppointment.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAppointmentsQueryKey() });
        }
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-3.5 h-3.5" />;
      case 'in_person': return <MapPin className="w-3.5 h-3.5" />;
      case 'phone': return <PhoneCall className="w-3.5 h-3.5" />;
      default: return <Video className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage advisor schedules and client meetings.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-card border rounded-xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Appointment" : "Book New Appointment"}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:bg-muted p-2 rounded-md"><X className="w-4 h-4" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name</label>
              <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Email</label>
              <input required type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Advisor</label>
              <select required value={formData.advisorId} onChange={e => setFormData({...formData, advisorId: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="">Select an advisor</option>
                {advisors?.map(adv => <option key={adv.id} value={adv.id}>{adv.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Type</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="video">Video Call (Zoom/Teams)</option>
                <option value="phone">Phone Call</option>
                <option value="in_person">In Person (Office)</option>
              </select>
            </div>

            {editingId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            
            <div className={`space-y-2 ${editingId ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}`}>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="Meeting agenda or preparation notes..." />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createAppointment.isPending || updateAppointment.isPending}>
                {editingId ? "Update Appointment" : "Book Appointment"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading appointments...</div>
        ) : !appointments?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No appointments</h3>
            <p className="text-muted-foreground mt-1 mb-4">There are no appointments scheduled in the system.</p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">Book Appointment</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Advisor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map(apt => {
                  const dateObj = new Date(apt.date);
                  const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <tr key={apt.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {apt.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {apt.advisorName}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium flex items-center gap-2 ${isPast && apt.status === 'scheduled' ? 'text-destructive' : 'text-foreground'}`}>
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {format(dateObj, "MMM d, yyyy")} at {apt.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground capitalize bg-muted/40 w-fit px-2 py-1 rounded-md text-xs font-medium">
                          {getTypeIcon(apt.type)}
                          {apt.type.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                          apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                          isPast ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {isPast && apt.status === 'scheduled' ? 'Overdue' : apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(apt)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(apt.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}