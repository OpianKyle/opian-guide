import { useState } from "react";
import { 
  useAdminListPolicies, 
  useAdminCreatePolicy, 
  useAdminUpdatePolicy, 
  useAdminDeletePolicy,
  getAdminListPoliciesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Shield, Plus, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Policies() {
  const queryClient = useQueryClient();
  const { data: policies, isLoading } = useAdminListPolicies();
  
  const createPolicy = useAdminCreatePolicy();
  const updatePolicy = useAdminUpdatePolicy();
  const deletePolicy = useAdminDeletePolicy();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    policyNumber: "", type: "life", clientName: "", coverAmount: "", premium: "", status: "active", startDate: "", renewalDate: ""
  });

  const resetForm = () => {
    setFormData({ policyNumber: "", type: "life", clientName: "", coverAmount: "", premium: "", status: "active", startDate: "", renewalDate: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (policy: any) => {
    setFormData({
      policyNumber: policy.policyNumber,
      type: policy.type,
      clientName: policy.clientName,
      coverAmount: policy.coverAmount.toString(),
      premium: policy.premium.toString(),
      status: policy.status,
      startDate: policy.startDate,
      renewalDate: policy.renewalDate || ""
    });
    setEditingId(policy.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      policyNumber: formData.policyNumber,
      type: formData.type,
      clientName: formData.clientName,
      coverAmount: parseFloat(formData.coverAmount),
      premium: parseFloat(formData.premium),
      status: formData.status,
      startDate: formData.startDate,
      ...(formData.renewalDate ? { renewalDate: formData.renewalDate } : {})
    };

    if (editingId) {
      updatePolicy.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPoliciesQueryKey() });
          resetForm();
        }
      });
    } else {
      createPolicy.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPoliciesQueryKey() });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this policy record? This action cannot be undone.")) {
      deletePolicy.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPoliciesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Policies</h1>
          <p className="text-muted-foreground">Manage active, pending, and lapsed client insurance policies.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Policy Record
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-card border rounded-xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Policy Record" : "Add Policy Record"}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:bg-muted p-2 rounded-md"><X className="w-4 h-4" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Number</label>
              <input required value={formData.policyNumber} onChange={e => setFormData({...formData, policyNumber: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none font-mono uppercase" placeholder="POL-123456" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium">Client Name</label>
              <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Type</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="life">Life Insurance</option>
                <option value="disability">Disability Cover</option>
                <option value="dread_disease">Dread Disease</option>
                <option value="income_protection">Income Protection</option>
                <option value="investment">Investment/Endowment</option>
                <option value="retirement">Retirement Annuity</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Amount ($)</label>
              <input required type="number" min="0" step="1000" value={formData.coverAmount} onChange={e => setFormData({...formData, coverAmount: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="500000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Premium ($)</label>
              <input required type="number" min="0" step="0.01" value={formData.premium} onChange={e => setFormData({...formData, premium: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" placeholder="150.50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="lapsed">Lapsed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Renewal Date (Optional)</label>
              <input type="date" value={formData.renewalDate} onChange={e => setFormData({...formData, renewalDate: e.target.value})} className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createPolicy.isPending || updatePolicy.isPending}>
                {editingId ? "Save Changes" : "Add Policy"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading policies...</div>
        ) : !policies?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No policies found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add your first client policy record to track premiums and coverage.</p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">Add Policy Record</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Policy Details</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4 text-right">Cover Amount</th>
                  <th className="px-6 py-4 text-right">Premium</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {policies.map(policy => {
                  const isExpiringSoon = policy.renewalDate && new Date(policy.renewalDate) < new Date(new Date().setMonth(new Date().getMonth() + 1));
                  
                  return (
                    <tr key={policy.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground font-mono">{policy.policyNumber}</div>
                        <div className="text-xs text-muted-foreground capitalize mt-0.5">{policy.type.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {policy.clientName}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${policy.coverAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        ${policy.premium.toLocaleString()}/mo
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            policy.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                            policy.status === 'pending' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {policy.status}
                          </span>
                          {isExpiringSoon && policy.status === 'active' && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" /> Renews {format(new Date(policy.renewalDate!), "MMM d")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(policy)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(policy.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
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