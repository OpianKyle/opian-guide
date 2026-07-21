import { useState, useEffect } from "react";
import { Upload, RefreshCw, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImportHistoryItem = {
  id: number;
  sourceUrl: string | null;
  importedCount: number;
  status: string;
  createdAt: string;
};

type QueueResult = {
  processed: number;
  sent: number;
  failed: number;
  completed: number;
};

function truncateUrl(url: string, max = 48) {
  if (!url) return "—";
  return url.length > max ? url.slice(0, max) + "…" : url;
}

export default function AdminImportLeads() {
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [queueResult, setQueueResult] = useState<QueueResult | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const r = await fetch("/api/admin/leads/import-history", { credentials: "include" });
      if (r.ok) setHistory(await r.json());
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const r = await fetch("/api/admin/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: sheetsUrl }),
      });
      const data = await r.json();
      if (!r.ok) {
        setImportError(data.error || "Import failed");
      } else {
        setImportResult(data);
        setSheetsUrl("");
        fetchHistory();
      }
    } catch {
      setImportError("Network error — please try again");
    } finally {
      setImporting(false);
    }
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    setQueueResult(null);
    try {
      const r = await fetch("/api/admin/email/process-queue", {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) setQueueResult(await r.json());
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Import Leads</h1>
        <p className="text-muted-foreground">Import from Google Sheets or manually trigger the email drip campaign queue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Google Sheets Import */}
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Google Sheets Import</h2>
                  <p className="text-sm text-muted-foreground">Paste your public sheet URL below</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                <div className="text-sm font-semibold text-green-800 mb-2">Sheet Format Requirements:</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• First row must be column headers</li>
                  <li>• Required column: <code className="bg-green-100 px-1 rounded font-mono text-xs">email</code></li>
                  <li>• Optional: <code className="bg-green-100 px-1 rounded font-mono text-xs">first_name</code>, <code className="bg-green-100 px-1 rounded font-mono text-xs">last_name</code>, <code className="bg-green-100 px-1 rounded font-mono text-xs">phone</code>, <code className="bg-green-100 px-1 rounded font-mono text-xs">company</code></li>
                  <li>• Sheet must be set to <strong>publicly accessible</strong> (Anyone with link)</li>
                </ul>
              </div>

              {importResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
                  <div className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Import Complete
                  </div>
                  <div className="text-blue-700">
                    ✅ {importResult.imported} imported &nbsp;·&nbsp; {importResult.skipped} skipped (duplicates)
                    {importResult.errors.length > 0 && (
                      <div className="mt-2 text-red-600">
                        ⚠️ {importResult.errors.length} errors: {importResult.errors.slice(0, 3).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm">
                  <div className="font-semibold text-red-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {importError}
                  </div>
                </div>
              )}

              <form onSubmit={handleImport} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Google Sheets URL</label>
                  <input
                    type="url"
                    required
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" disabled={importing} className="w-full gap-2">
                  {importing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Importing…</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Import &amp; Start Campaign</>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Process Email Queue / Drip Campaign */}
          <div className="bg-sidebar border rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-sidebar-foreground mb-1">Email Drip Campaign — Process Queue</h2>
            <p className="text-sm text-sidebar-foreground/60 mb-4">
              Click below to manually advance the drip campaign — sends the next scheduled email to every active lead. In production, automate this with a daily cron job calling{" "}
              <code className="bg-white/10 px-1 rounded font-mono text-xs">POST /api/admin/email/process-queue</code>.
            </p>

            {queueResult && (
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4 text-sm text-sidebar-foreground">
                <div className="font-semibold mb-2">Queue processed successfully</div>
                <div className="grid grid-cols-2 gap-2 text-sidebar-foreground/80">
                  <div>📬 Processed: <strong>{queueResult.processed}</strong></div>
                  <div>✅ Sent: <strong>{queueResult.sent}</strong></div>
                  <div>❌ Failed: <strong>{queueResult.failed}</strong></div>
                  <div>🏁 Completed: <strong>{queueResult.completed}</strong></div>
                </div>
              </div>
            )}

            <Button
              onClick={handleProcessQueue}
              disabled={processing}
              variant="secondary"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-none"
            >
              {processing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Play className="w-4 h-4" /> Process Email Queue Now</>
              )}
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Import History */}
          <div className="bg-card border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Import History</h2>
              <button onClick={fetchHistory} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            {historyLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No imports yet</div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-muted-foreground text-xs truncate flex-1 font-mono">
                        {truncateUrl(item.sourceUrl || "")}
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-green-600 font-medium">✓ {item.importedCount} imported</span>
                      <span className="text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column Reference */}
          <div className="bg-card border rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Column Name Reference</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accepted Names</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr><td className="py-2.5 text-foreground font-medium">Email <span className="text-red-500">*</span></td><td className="py-2.5 font-mono text-xs text-muted-foreground">email</td></tr>
                <tr><td className="py-2.5 text-foreground font-medium">First Name</td><td className="py-2.5 font-mono text-xs text-muted-foreground">first_name, firstname</td></tr>
                <tr><td className="py-2.5 text-foreground font-medium">Last Name</td><td className="py-2.5 font-mono text-xs text-muted-foreground">last_name, lastname</td></tr>
                <tr><td className="py-2.5 text-foreground font-medium">Phone</td><td className="py-2.5 font-mono text-xs text-muted-foreground">phone, mobile, cell</td></tr>
                <tr><td className="py-2.5 text-foreground font-medium">Company</td><td className="py-2.5 font-mono text-xs text-muted-foreground">company, organisation</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
