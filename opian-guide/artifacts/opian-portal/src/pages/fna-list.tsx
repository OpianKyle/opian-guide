import { useListFnaSubmissions, useUpdateFnaStatus, getListFnaSubmissionsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Search, Plus, Eye, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function FnaList() {
  const { data: submissions, isLoading } = useListFnaSubmissions();
  const updateStatusMutation = useUpdateFnaStatus();
  const queryClient = useQueryClient();

  const handleStatusUpdate = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        // Optimistic update or invalidation
        queryClient.invalidateQueries({ queryKey: getListFnaSubmissionsQueryKey() });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Completed</Badge>;
      case "reviewed": return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Reviewed</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending Review</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">FNA Submissions</h1>
          <p className="text-muted-foreground mt-1">Track and review Financial Needs Analyses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-9 bg-white" />
          </div>
          <Link href="/fna">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> New FNA
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Risk Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : submissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 mb-2 opacity-20" />
                      <p>No FNA submissions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                submissions?.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {sub.firstName} {sub.lastName}
                      <span className="block text-xs text-muted-foreground font-normal">{sub.email}</span>
                    </TableCell>
                    <TableCell className="text-sm">{sub.phone}</TableCell>
                    <TableCell className="text-sm">{format(new Date(sub.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-sm capitalize">{sub.riskProfile}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleStatusUpdate(sub.id, "Reviewed")}
                            disabled={sub.status === "Reviewed" || sub.status === "Completed"}
                          >
                            <Clock className="mr-2 h-4 w-4" /> Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleStatusUpdate(sub.id, "Completed")}
                            disabled={sub.status === "Completed"}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
