import { useState } from "react";
import { 
  useAdminListAdvisors, 
  useAdminCreateAdvisor, 
  useAdminUpdateAdvisor, 
  useAdminDeleteAdvisor,
  getAdminListAdvisorsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, Briefcase, Mail, Phone } from "lucide-react";

export default function Advisors() {
  const queryClient = useQueryClient();
  const { data: advisors, isLoading } = useAdminListAdvisors();
  
  const createAdvisor = useAdminCreateAdvisor();
  const updateAdvisor = useAdminUpdateAdvisor();
  const deleteAdvisor = useAdminDeleteAdvisor();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "", title: "", email: "", phone: "", initials: "", specializations: "", password: ""
  });

  const resetForm = () => {
    setFormData({ name: "", title: "", email: "", phone: "", initials: "", specializations: "", password: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (advisor: any) => {
    setFormData({
      name: advisor.name,
      title: advisor.title,
      email: advisor.email,
      phone: advisor.phone,
      initials: advisor.initials,
      specializations: advisor.specializations.join(", "),
      password: "" // Keep empty on edit
    });
    setEditingId(advisor.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      initials: formData.initials,
      specializations: formData.specializations.split(",").map(s => s.trim()).filter(Boolean),
      ...(formData.password ? { password: formData.password } : {})
    };

    if (editingId) {
      updateAdvisor.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdvisorsQueryKey() });
          resetForm();
        }
      });
    } else {
      createAdvisor.mutate({ data: payload as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdvisorsQueryKey() });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this advisor? This action cannot be undone.")) {
      deleteAdvisor.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdvisorsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Advisors</h1>
          <p className="text-muted-foreground">Manage financial advisors and their access.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Advisor
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-card border rounded-xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Advisor" : "Create New Advisor"}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:bg-muted p-2 rounded-md"><X className="w-4 h-4" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="Senior Financial Advisor" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="jane@opian.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initials</label>
              <input required maxLength={3} value={formData.initials} onChange={e => setFormData({...formData, initials: e.target.value.toUpperCase()})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none uppercase" placeholder="JD" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password {editingId && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}</label>
              <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="••••••••" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Specializations (comma separated)</label>
              <input value={formData.specializations} onChange={e => setFormData({...formData, specializations: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="Retirement Planning, Wealth Management" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createAdvisor.isPending || updateAdvisor.isPending}>
                {editingId ? "Save Changes" : "Create Advisor"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading advisors...</div>
        ) : !advisors?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No advisors found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add your first financial advisor to the platform.</p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">Add Advisor</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Advisor</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Specializations</th>
                  <th className="px-6 py-4 text-right">Clients</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {advisors.map(advisor => (
                  <tr key={advisor.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {advisor.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{advisor.name}</div>
                          <div className="text-xs text-muted-foreground">{advisor.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {advisor.email}</div>
                        <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {advisor.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {advisor.specializations?.map((spec, i) => (
                          <span key={i} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {advisor.clientCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(advisor)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(advisor.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}