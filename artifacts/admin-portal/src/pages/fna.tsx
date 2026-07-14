import { useState } from "react";
import { 
  useAdminListFna, 
  useAdminGetFna,
  useAdminUpdateFna, 
  useAdminDeleteFna,
  getAdminListFnaQueryKey,
  useAdminListAdvisors
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Eye, Trash2, Loader2 } from "lucide-react";

export default function Fna() {
  const queryClient = useQueryClient();
  const { data: fnaList, isLoading } = useAdminListFna();
  const { data: advisors } = useAdminListAdvisors();
  
  const updateFna = useAdminUpdateFna();
  const deleteFna = useAdminDeleteFna();
  
  const [filter, setFilter] = useState("all");
  const [selectedFnaId, setSelectedFnaId] = useState<number | null>(null);

  // Fetch full details for the selected FNA
  const { data: selectedFna, isLoading: isLoadingDetail } = useAdminGetFna(
    selectedFnaId as number, 
    { query: { enabled: selectedFnaId !== null } }
  );

  const filteredFna = fnaList?.filter(fna => {
    if (filter === "all") return true;
    return fna.status === filter;
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateFna.mutate({ id, data: { status, advisorId: selectedFna?.advisorId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListFnaQueryKey() });
        // Optional: invalidate specific get query if we want, but list will update
        if (selectedFnaId === id && selectedFna) {
          queryClient.setQueryData(['adminGetFna', id], { ...selectedFna, status });
        }
      }
    });
  };

  const handleAssignAdvisor = (id: number, advisorId: string) => {
    const numericAdvisorId = advisorId ? parseInt(advisorId) : null;
    updateFna.mutate({ id, data: { status: selectedFna?.status || 'pending', advisorId: numericAdvisorId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListFnaQueryKey() });
        if (selectedFnaId === id && selectedFna) {
          queryClient.setQueryData(['adminGetFna', id], { ...selectedFna, advisorId: numericAdvisorId });
        }
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this FNA submission?")) {
      deleteFna.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListFnaQueryKey() });
          if (selectedFnaId === id) setSelectedFnaId(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Needs Analysis</h1>
          <p className="text-muted-foreground">Review submissions and assign to advisors.</p>
        </div>
      </div>

      <div className="flex gap-2 bg-card border rounded-lg p-1 w-fit">
        {['all', 'pending', 'in_progress', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === status ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List View */}
        <div className="lg:col-span-2 bg-card border rounded-xl overflow-hidden shadow-sm h-[600px] flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              Loading submissions...
            </div>
          ) : !filteredFna?.length ? (
            <div className="p-12 text-center flex flex-col items-center flex-1 justify-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No submissions found</h3>
              <p className="text-muted-foreground mt-1">No FNA submissions match the current filter.</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFna.map(fna => {
                    const assignedAdvisor = advisors?.find(a => a.id === fna.advisorId);
                    const isSelected = selectedFnaId === fna.id;
                    
                    return (
                      <tr 
                        key={fna.id} 
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/10'}`}
                        onClick={() => setSelectedFnaId(fna.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{fna.firstName} {fna.lastName}</div>
                          <div className="text-xs text-muted-foreground">{fna.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            fna.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            fna.status === 'in_progress' ? 'bg-amber-500/10 text-amber-600' :
                            fna.status === 'pending' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {fna.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {assignedAdvisor ? assignedAdvisor.name : <span className="text-amber-600/80 italic text-xs">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(fna.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className={`p-2 rounded-md transition-colors ${isSelected ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(fna.id); }} 
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
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

        {/* Detail View */}
        <div className="bg-card border rounded-xl shadow-sm h-[600px] flex flex-col overflow-hidden">
          {!selectedFnaId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a submission to view details and assign advisors.</p>
            </div>
          ) : isLoadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading full details...</p>
            </div>
          ) : selectedFna ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-muted/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedFna.firstName} {selectedFna.lastName}</h2>
                    <div className="text-sm text-muted-foreground">{selectedFna.email} • {selectedFna.phone}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                    selectedFna.status === 'completed' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' :
                    selectedFna.status === 'in_progress' ? 'border-amber-500/30 text-amber-600 bg-amber-500/10' :
                    'border-blue-500/30 text-blue-600 bg-blue-500/10'
                  }`}>
                    {selectedFna.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid gap-4 mt-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Advisor</label>
                    <select 
                      value={selectedFna.advisorId || ""} 
                      onChange={(e) => handleAssignAdvisor(selectedFna.id, e.target.value)}
                      className="w-full h-9 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none"
                    >
                      <option value="">-- Unassigned --</option>
                      {advisors?.map(adv => (
                        <option key={adv.id} value={adv.id}>{adv.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Status</label>
                    <select 
                      value={selectedFna.status} 
                      onChange={(e) => handleUpdateStatus(selectedFna.id, e.target.value)}
                      className="w-full h-9 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold border-b pb-2 mb-3">Client Information</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div><span className="text-muted-foreground block text-xs">DOB</span> {selectedFna.dob || '—'}</div>
                    <div><span className="text-muted-foreground block text-xs">Gender</span> {selectedFna.gender || '—'}</div>
                    <div><span className="text-muted-foreground block text-xs">Smoker</span> {selectedFna.smoker || '—'}</div>
                    <div><span className="text-muted-foreground block text-xs">Marital Status</span> {selectedFna.maritalStatus || '—'}</div>
                    <div><span className="text-muted-foreground block text-xs">Dependants</span> {selectedFna.dependants || '0'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold border-b pb-2 mb-3">Financial Profile</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div><span className="text-muted-foreground block text-xs">Gross Income</span> ${selectedFna.grossMonthlyIncome?.toLocaleString() || '0'}</div>
                    <div><span className="text-muted-foreground block text-xs">Net Income</span> ${selectedFna.netMonthlyIncome?.toLocaleString() || '0'}</div>
                    <div><span className="text-muted-foreground block text-xs">Monthly Expenses</span> ${selectedFna.monthlyExpenses?.toLocaleString() || '0'}</div>
                    <div><span className="text-muted-foreground block text-xs">Savings</span> ${selectedFna.savings?.toLocaleString() || '0'}</div>
                    <div><span className="text-muted-foreground block text-xs">Investments</span> ${selectedFna.investments?.toLocaleString() || '0'}</div>
                    <div><span className="text-muted-foreground block text-xs">Total Debts</span> ${(selectedFna.homeLoans + selectedFna.personalLoans + selectedFna.creditCards)?.toLocaleString() || '0'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold border-b pb-2 mb-3">Goals & Priorities</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground block text-xs">Risk Profile</span> <span className="capitalize">{selectedFna.riskProfile || '—'}</span></div>
                    <div><span className="text-muted-foreground block text-xs">Investment Horizon</span> {selectedFna.investmentHorizon} years</div>
                    <div><span className="text-muted-foreground block text-xs">Primary Priorities</span> {selectedFna.priorities || '—'}</div>
                  </div>
                </div>
                
                {selectedFna.notes && (
                  <div>
                    <h3 className="text-sm font-semibold border-b pb-2 mb-3">Notes</h3>
                    <p className="text-sm bg-muted/20 p-3 rounded-md border">{selectedFna.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}