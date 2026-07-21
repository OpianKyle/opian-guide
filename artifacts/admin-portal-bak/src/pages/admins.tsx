import { useState } from "react";
import { 
  useAdminListAdmins, 
  useAdminCreateAdmin, 
  useAdminUpdateAdmin, 
  useAdminDeleteAdmin,
  getAdminListAdminsQueryKey,
  useAdminGetSession
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, UserCog, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function Admins() {
  const queryClient = useQueryClient();
  const { data: session } = useAdminGetSession();
  const { data: admins, isLoading } = useAdminListAdmins({ query: { enabled: session?.admin?.role === 'super_admin' } });
  
  const createAdmin = useAdminCreateAdmin();
  const updateAdmin = useAdminUpdateAdmin();
  const deleteAdmin = useAdminDeleteAdmin();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "", email: "", role: "admin", password: ""
  });

  if (session?.admin?.role !== 'super_admin') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Only Super Administrators can access and manage administrative users. 
          Your current role does not have the required permissions.
        </p>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "admin", password: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (admin: any) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: ""
    });
    setEditingId(admin.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.password ? { password: formData.password } : {})
    };

    if (editingId) {
      updateAdmin.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdminsQueryKey() });
          resetForm();
        }
      });
    } else {
      createAdmin.mutate({ data: payload as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdminsQueryKey() });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (session?.admin?.id === id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      deleteAdmin.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListAdminsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Users</h1>
          <p className="text-muted-foreground">Manage platform administrators and their roles.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-card border rounded-xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Admin" : "Create New Admin"}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:bg-muted p-2 rounded-md"><X className="w-4 h-4" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="Admin Name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="admin@opian.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password {editingId && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}</label>
              <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="••••••••" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createAdmin.isPending || updateAdmin.isPending}>
                {editingId ? "Save Changes" : "Create Admin"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading admins...</div>
        ) : !admins?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <UserCog className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No admins found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Added</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {admin.name} {session?.admin?.id === admin.id && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-500/10 text-slate-600'
                      }`}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(admin.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(admin)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)} 
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                          disabled={session?.admin?.id === admin.id}
                          title={session?.admin?.id === admin.id ? "Cannot delete yourself" : "Delete admin"}
                        >
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