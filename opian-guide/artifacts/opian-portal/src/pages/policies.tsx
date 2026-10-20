import { useListPolicies } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Shield, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Policies() {
  const { data: policies, isLoading } = useListPolicies();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Policies</h1>
          <p className="text-muted-foreground mt-1">Manage and review your active cover</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search policies..." className="pl-9 bg-white" />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Cover Amount</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : policies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="h-10 w-10 mb-2 opacity-20" />
                      <p>No policies found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                policies?.map((policy, i) => (
                  <TableRow key={policy.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-primary">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {policy.policyNumber}
                      </div>
                    </TableCell>
                    <TableCell>{policy.type}</TableCell>
                    <TableCell>{policy.clientName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(policy.coverAmount)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(policy.premium)}/mo
                    </TableCell>
                    <TableCell>{format(new Date(policy.startDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
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
