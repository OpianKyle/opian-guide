import { useMemo, useState } from "react";
import { useListToolkitSubmissions } from "@workspace/api-client-react";
import {
  getToolkitAnswerSections,
  getToolkitName,
  type ToolkitAnswers,
  type ToolkitKind,
} from "@workspace/toolkit-core";
import { Download, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { downloadToolkitPdf } from "@/lib/toolkit-pdf";

export default function ToolkitSubmissions() {
  const { data: submissions = [], isLoading, error } = useListToolkitSubmissions();
  const [filter, setFilter] = useState<"all" | ToolkitKind>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  const filtered = useMemo(() => submissions.filter((submission) => {
    const matchesKind = filter === "all" || submission.toolkit === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query
      || submission.clientName.toLowerCase().includes(query)
      || submission.clientEmail.toLowerCase().includes(query)
      || (submission.businessName ?? "").toLowerCase().includes(query);
    return matchesKind && matchesSearch;
  }), [submissions, filter, search]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const sections = selected
    ? getToolkitAnswerSections(selected.toolkit as ToolkitKind, selected.answers as ToolkitAnswers)
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Client planning</p>
        <h1 className="mt-2 text-3xl font-serif font-bold">Toolkit submissions</h1>
        <p className="mt-2 text-muted-foreground">Review client answers and download their personal or business reports.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "personal", "business"] as const).map((value) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(value)}
              className="capitalize"
            >
              {value === "all" ? "All toolkits" : value}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <Card><CardContent className="p-8 text-center text-destructive">Toolkit submissions could not be loaded.</CardContent></Card>
      ) : isLoading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Loading submissions…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No toolkit submissions match this search.</CardContent></Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <Card className="h-fit overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Submissions ({filtered.length})</CardTitle>
              <CardDescription>Select a submission to review the answers.</CardDescription>
            </CardHeader>
            <div className="max-h-[680px] overflow-y-auto">
              {filtered.map((submission) => (
                <button
                  type="button"
                  key={submission.id}
                  onClick={() => setSelectedId(submission.id)}
                  className={`w-full border-b px-5 py-4 text-left transition-colors ${
                    selected?.id === submission.id ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{submission.clientName}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{submission.clientEmail}</span>
                      <span className="mt-2 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                        <span>{getToolkitName(submission.toolkit)}</span>
                        <span>·</span>
                        <span>{new Date(submission.createdAt).toLocaleDateString("en-ZA")}</span>
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selected && (
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{getToolkitName(selected.toolkit)}</CardTitle>
                    <CardDescription className="mt-1">
                      {selected.clientName} · {selected.clientEmail}
                      {selected.businessName ? ` · ${selected.businessName}` : ""}
                    </CardDescription>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Phone: {selected.phone} · Submitted {new Date(selected.createdAt).toLocaleString("en-ZA")}
                    </p>
                  </div>
                  <Button onClick={() => void downloadToolkitPdf(selected)}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-5 sm:p-6">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="mb-3 border-b pb-2 font-semibold text-foreground">{section.title}</h2>
                    <dl className="space-y-3">
                      {section.rows.map((row) => (
                        <div key={row.label} className="grid gap-1 sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.3fr)]">
                          <dt className="text-sm text-muted-foreground">{row.label}</dt>
                          <dd className="whitespace-pre-wrap break-words text-sm font-medium">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
