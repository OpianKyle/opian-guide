import { useState } from "react";
import { useListDocuments, useUploadDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FolderOpen, FileText, Download, MoreVertical, Upload, File, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const uploadSchema = z.object({
  name: z.string().min(2, "File name is required"),
  type: z.string().min(1, "File type is required"),
  clientName: z.string().min(1, "Client name is required"),
  size: z.string().default("2.4 MB"),
});

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const uploadMutation = useUploadDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: "",
      type: "application/pdf",
      clientName: "Kyle User",
      size: "1.2 MB",
    },
  });

  const onSubmit = (data: z.infer<typeof uploadSchema>) => {
    uploadMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        setIsUploadOpen(false);
        form.reset();
        toast({
          title: "Document Uploaded",
          description: "Your document has been securely saved.",
        });
      }
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileText className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

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
            <Input placeholder="Search files..." className="pl-9 bg-white" />
          </div>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ID Copy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Type</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="application/pdf">PDF Document</option>
                            <option value="image/jpeg">JPEG Image</option>
                            <option value="image/png">PNG Image</option>
                            <option value="application/msword">Word Document</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to browse or drag file here</p>
                    <p className="text-xs text-muted-foreground mt-1">Max file size: 10MB</p>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? "Uploading..." : "Save Document"}
                  </Button>
                </form>
              </Form>
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
        ) : documents?.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl bg-white/50">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">No documents found</p>
            <p className="text-sm text-muted-foreground mt-1">Upload files to keep them safe</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsUploadOpen(true)}>Upload Document</Button>
          </div>
        ) : (
          documents?.map((doc) => (
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
                    {doc.size} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant="secondary" className="mt-1 bg-muted font-normal text-xs truncate max-w-[120px]">
                  {doc.type.split('/').pop() || doc.type}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
