import { useListToolkitSubmissions } from "@workspace/api-client-react";
import { getToolkitName, type ToolkitKind } from "@workspace/toolkit-core";
import { Download, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { downloadToolkitPdf } from "@/lib/toolkit-pdf";

export default function ToolkitDashboardPanel({ admin = false }: { admin?: boolean }) {
  const { data: submissions = [], isLoading, error } = useListToolkitSubmissions();
  const route = admin ? "/admin/toolkit-submissions" : "/toolkit-submissions";
  const recent = submissions.slice(0, 5);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Recent Toolkit Submissions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Review client answers or download their report PDFs.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={route}>View all</Link>
        </Button>
      </div>
      {isLoading ? (
        <p className="p-6 text-sm text-muted-foreground">Loading submissions…</p>
      ) : error ? (
        <p className="p-6 text-sm text-destructive">Toolkit submissions could not be loaded.</p>
      ) : recent.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No toolkit submissions yet.</p>
      ) : (
        <div className="divide-y">
          {recent.map((submission) => (
            <div key={submission.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{submission.clientName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {getToolkitName(submission.toolkit as ToolkitKind)}
                  {submission.businessName ? ` · ${submission.businessName}` : ""}
                  {" · "}
                  {new Date(submission.createdAt).toLocaleDateString("en-ZA")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`${route}?id=${submission.id}`}>View answers</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Download ${submission.clientName}'s ${submission.toolkit} report`}
                  onClick={() => void downloadToolkitPdf(submission)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
