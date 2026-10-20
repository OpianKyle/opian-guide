import { useState } from "react";
import { 
  useAdminListClients, 
  useAdminGetClient,
  useAdminDeleteClient,
  getAdminListClientsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Trash2, Mail, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const queryClient = useQueryClient();
  const { data: clients, isLoading } = useAdminListClients();
  const deleteClient = useAdminDeleteClient();

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  
  // Fetch detailed client info when a client is selected
  const { data: clientDetail, isLoading: isLoadingDetail } = useAdminGetClient(
    selectedClientId as number,
    { query: { enabled: selectedClientId !== null } }
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this client? This will permanently delete their portal access.")) {
      deleteClient.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListClientsQueryKey() });
          if (selectedClientId === id) setSelectedClientId(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Directory</h1>
          <p className="text-muted-foreground">Read-only view of all registered client portal users.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading clients...</div>
        ) : !clients?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No clients found</h3>
            <p className="text-muted-foreground mt-1">No clients have registered for the portal yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">System ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {client.name.substring(0, 2)}
                        </div>
                        <div className="font-medium text-foreground">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(client.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        CLI-{client.id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedClientId(client.id)} 
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" 
                          title="View Full Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)} 
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" 
                          title="Revoke Access"
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

      {/* Client Detail Modal */}
      {selectedClientId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
              <h3 className="font-semibold text-lg">Client Details</h3>
              <button onClick={() => setSelectedClientId(null)} className="text-muted-foreground hover:bg-muted p-1.5 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Loading client data...</p>
                </div>
              ) : clientDetail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold uppercase">
                      {clientDetail.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{clientDetail.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {clientDetail.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 pt-4 border-t">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">System ID</label>
                      <div className="font-mono text-sm bg-muted/40 px-3 py-2 rounded-md border inline-block">
                        CLI-{clientDetail.id.toString().padStart(4, '0')}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Registered On</label>
                      <div className="text-sm font-medium">
                        {format(new Date(clientDetail.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedClientId(null)}>Close</Button>
                    <Button variant="destructive" onClick={() => {
                      handleDelete(clientDetail.id);
                      setSelectedClientId(null);
                    }}>Revoke Access</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Failed to load client details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}