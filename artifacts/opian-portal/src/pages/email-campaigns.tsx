import { useEffect, useState } from "react";
import { Code2, Eye, Mail, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type CampaignSummary = {
  day: number;
  subject: string;
  isCustomized: boolean;
  updatedAt: string | null;
};

type CampaignDetail = {
  day: number;
  subject: string;
  bodyHtml: string;
  isCustomized: boolean;
};

const DAY_LABELS: Record<number, string> = {
  0: "Welcome",
  7: "1 Week Check-In",
  14: "2 Week Offer",
  25: "Free Review",
  28: "Closing Soon",
  29: "Second to Last",
  30: "Final Email",
};

async function getError(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return typeof data.error === "string" ? data.error : `Request failed (${response.status})`;
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<CampaignDetail | null>(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [editing, setEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCampaigns = async () => {
    setLoadingList(true);
    setError("");
    try {
      const response = await fetch("/api/admin/campaigns", { credentials: "include" });
      if (!response.ok) throw new Error(await getError(response));
      setCampaigns(await response.json());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load email campaigns.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const openCampaign = async (day: number) => {
    setLoadingDetail(true);
    setError("");
    setNotice("");
    setEditing(false);
    setSelected(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${day}`, { credentials: "include" });
      if (!response.ok) throw new Error(await getError(response));
      const detail: CampaignDetail = await response.json();
      setSelected(detail);
      setSubject(detail.subject);
      setBodyHtml(detail.bodyHtml);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this email.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/campaigns/${selected.day}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      if (!response.ok) throw new Error(await getError(response));
      setSelected({ ...selected, subject, bodyHtml, isCustomized: true });
      setCampaigns((items) =>
        items.map((item) =>
          item.day === selected.day ? { ...item, subject, isCustomized: true } : item,
        ),
      );
      setEditing(false);
      setShowPreview(true);
      setPreviewVersion((version) => version + 1);
      setNotice("Email saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this email.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!selected || !confirm(`Reset Day ${selected.day} to the default email? Your edits will be lost.`)) {
      return;
    }
    setResetting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/campaigns/${selected.day}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await getError(response));
      setPreviewVersion((version) => version + 1);
      await openCampaign(selected.day);
      setNotice("Email reset to the default.");
      void loadCampaigns();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not reset this email.");
    } finally {
      setResetting(false);
    }
  };

  const startEditing = () => {
    if (!selected) return;
    setSubject(selected.subject);
    setBodyHtml(selected.bodyHtml);
    setEditing(true);
    setShowPreview(false);
    setError("");
    setNotice("");
  };

  const cancelEditing = () => {
    if (!selected) return;
    setSubject(selected.subject);
    setBodyHtml(selected.bodyHtml);
    setEditing(false);
    setShowPreview(true);
    setError("");
  };

  const previewUrl = selected
    ? `/api/admin/campaigns/${selected.day}/preview?name=Jane`
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the 31 emails in the lead follow-up sequence.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      <div className="grid min-h-[620px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-4">
            <p className="font-semibold text-foreground">30-day sequence</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {campaigns.filter((item) => item.isCustomized).length} customized
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingList ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              campaigns.map((campaign) => (
                <button
                  key={campaign.day}
                  type="button"
                  onClick={() => void openCampaign(campaign.day)}
                  className={`mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    selected?.day === campaign.day
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {campaign.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-muted-foreground">
                      {DAY_LABELS[campaign.day] || `Day ${campaign.day}`}
                    </span>
                    <span className="mt-0.5 block truncate text-sm">{campaign.subject}</span>
                  </span>
                  {campaign.isCustomized && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" title="Customized" />
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
          {loadingDetail ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading email…
            </div>
          ) : !selected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <Mail className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">Select an email to edit</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a day from the sequence on the left.
              </p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Day {selected.day} · {DAY_LABELS[selected.day] || "Follow-up"}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold">{editing ? subject : selected.subject}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {editing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => void save()} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving…" : "Save"}
                      </Button>
                    </>
                  ) : (
                    <>
                      {selected.isCustomized && (
                        <Button variant="outline" size="sm" onClick={() => void resetToDefault()} disabled={resetting}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {resetting ? "Resetting…" : "Reset"}
                        </Button>
                      )}
                      <Button size="sm" onClick={startEditing}>
                        <Code2 className="mr-2 h-4 w-4" />
                        Edit Email
                      </Button>
                    </>
                  )}
                </div>
              </header>

              {editing && (
                <div className="grid gap-4 border-b p-5">
                  <div className="space-y-2">
                    <label htmlFor="campaign-subject" className="text-sm font-medium">Subject</label>
                    <input
                      id="campaign-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={showPreview ? "outline" : "default"}
                      onClick={() => setShowPreview(false)}
                    >
                      <Code2 className="mr-2 h-4 w-4" /> HTML
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={showPreview ? "default" : "outline"}
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </div>
                  {showPreview ? (
                    <div className="h-[360px] overflow-hidden rounded-lg border bg-white">
                      <iframe
                        key={previewVersion}
                        title={`Preview of day ${selected.day} email`}
                        srcDoc={bodyHtml.replace(/\{\{firstName\}\}/g, "Jane")}
                        sandbox="allow-same-origin"
                        className="h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor="campaign-html" className="text-sm font-medium">Email HTML</label>
                      <textarea
                        id="campaign-html"
                        rows={18}
                        spellCheck={false}
                        value={bodyHtml}
                        onChange={(event) => setBodyHtml(event.target.value)}
                        className="w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use <code>{"{{firstName}}"}</code> where the recipient’s first name should appear.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!editing && (
                <div className="flex-1 overflow-hidden p-4">
                  <iframe
                    key={previewVersion}
                    title={`Preview of day ${selected.day} email`}
                    src={previewUrl}
                    sandbox="allow-same-origin"
                    className="h-full min-h-[480px] w-full rounded-lg border bg-white"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
