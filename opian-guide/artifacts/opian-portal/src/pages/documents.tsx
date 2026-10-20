import { useState, useRef } from "react";
import { useListDocuments, useUploadDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FolderOpen, FileText, Download, MoreVertical, Upload, File, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const uploadMutation = useUploadDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Auto-fill name from filename (strip extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setDocName(nameWithoutExt);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleOpenChange = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open) {
      setSelectedFile(null);
      setDocName("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please choose a file to upload.", variant: "destructive" });
      return;
    }
    if (!docName.trim()) {
      toast({ title: "Name required", description: "Please enter a document name.", variant: "destructive" });
      return;
    }

    uploadMutation.mutate(
      {
        data: {
          name: docName.trim(),
          type: selectedFile.type || "application/octet-stream",
          clientName: user?.name ?? "Unknown",
          size: formatBytes(selectedFile.size),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
          handleOpenChange(false);
          toast({ title: "Document Uploaded", description: "Your document has been securely saved." });
        },
        onError: (err) => {
          toast({ title: "Upload failed", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes("word") || type.includes("doc")) return <FileText className="h-8 w-8 text-blue-500" />;
    if (type.includes("excel") || type.includes("sheet")) return <FileText className="h-8 w-8 text-green-500" />;
    if (type.includes("image")) return <File className="h-8 w-8 text-purple-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const filtered = documents?.filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) || d.clientName.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Secure vault for all your financial documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={isUploadOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-2">
                {/* File drop zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-muted/20"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileInputChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3 w-full">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setDocName(""); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-center">Click to browse or drag file here</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, images — max 10 MB</p>
                    </>
                  )}
                </div>

                {/* Document name */}
                <div className="space-y-1.5">
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="e.g. ID Copy"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                  />
                </div>

                {/* Uploading as */}
                <p className="text-xs text-muted-foreground">
                  Uploading as <span className="font-medium text-foreground">{user?.name ?? "you"}</span>
                </p>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={uploadMutation.isPending || !selectedFile}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Save Document"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center h-40">
                <Skeleton className="h-10 w-10 rounded mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : filtered?.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl bg-white/50">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">
              {search ? "No files match your search" : "No documents yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Try a different search term" : "Upload files to keep them safe"}
            </p>
            {!search && (
              <Button variant="outline" className="mt-4" onClick={() => setIsUploadOpen(true)}>
                Upload Document
              </Button>
            )}
          </div>
        ) : (
          filtered?.map((doc) => (
            <Card key={doc.id} className="shadow-sm hover:shadow-md transition-shadow group border-border relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className="h-16 w-16 bg-muted/50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getFileIcon(doc.type)}
                </div>
                <div className="w-full">
                  <p className="font-medium text-sm text-foreground truncate px-2" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {doc.size} • {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="secondary" className="mt-1 bg-muted font-normal text-xs truncate max-w-[120px]">
                  {doc.type.split("/").pop() || doc.type}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
