import { 
  useAdminListDocuments, 
  useAdminUpdateDocument, 
  useAdminDeleteDocument,
  getAdminListDocumentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FolderOpen, FileText, Trash2, CheckCircle, XCircle, Download, File, FileImage, FileBarChart } from "lucide-react";

export default function Documents() {
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useAdminListDocuments();
  
  const updateDocument = useAdminUpdateDocument();
  const deleteDocument = useAdminDeleteDocument();

  const handleStatusUpdate = (id: number, status: string) => {
    updateDocument.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDocumentsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListDocumentsQueryKey() });
        }
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
    if (type.includes('image')) return <FileImage className="w-8 h-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return <FileBarChart className="w-8 h-8 text-emerald-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Document verification</h1>
          <p className="text-muted-foreground">Review and verify client uploaded identity and financial documents.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
        ) : !documents?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No documents</h3>
            <p className="text-muted-foreground mt-1">Clients have not uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4">Document Details</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Uploaded</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      {getFileIcon(doc.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground max-w-[200px] truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                          {doc.type.split('/')[1] || doc.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {doc.clientName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(doc.uploadedAt), "MMM d, yyyy • h:mm a")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 w-fit ${
                        doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        doc.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {doc.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                        {doc.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(doc.id, 'verified')}
                              className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md transition-colors"
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(doc.id, 'rejected')}
                              className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete">
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