import { useState, useEffect, useRef } from "react";
import { Mail, Edit2, RotateCcw, Save, X, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/../api${path}`;

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

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CampaignDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBodyHtml, setEditBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("preview");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewKey = useRef(0);

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await fetch(API("/admin/campaigns"), { credentials: "include" });
      if (r.ok) setCampaigns(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const openTemplate = async (day: number) => {
    setLoadingDetail(true);
    setEditing(false);
    setSaveSuccess(false);
    setSelected(null);
    try {
      const r = await fetch(API(`/admin/campaigns/${day}`), { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setSelected(data);
        setEditSubject(data.subject);
        setEditBodyHtml(data.bodyHtml);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const startEditing = () => {
    if (!selected) return;
    setEditSubject(selected.subject);
    setEditBodyHtml(selected.bodyHtml);
    setEditing(true);
    setPreviewMode("code");
  };

  const cancelEditing = () => {
    setEditing(false);
    setPreviewMode("preview");
    if (selected) {
      setEditSubject(selected.subject);
      setEditBodyHtml(selected.bodyHtml);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const r = await fetch(API(`/admin/campaigns/${selected.day}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: editSubject, bodyHtml: editBodyHtml }),
      });
      if (r.ok) {
        const updated = { ...selected, subject: editSubject, bodyHtml: editBodyHtml, isCustomized: true };
        setSelected(updated);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.day === selected.day ? { ...c, subject: editSubject, isCustomized: true } : c
          )
        );
        setEditing(false);
        setPreviewMode("preview");
        setSaveSuccess(true);
        previewKey.current++;
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!selected || !confirm(`Reset Day ${selected.day} to the default template? Your edits will be lost.`)) return;
    setResetting(true);
    try {
      await fetch(API(`/admin/campaigns/${selected.day}`), {
        method: "DELETE",
        credentials: "include",
      });
      // Reload detail (now returns hardcoded default)
      const r = await fetch(API(`/admin/campaigns/${selected.day}`), { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setSelected(data);
        setEditSubject(data.subject);
        setEditBodyHtml(data.bodyHtml);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.day === selected.day ? { ...c, subject: data.subject, isCustomized: false } : c
          )
        );
        previewKey.current++;
      }
    } finally {
      setResetting(false);
    }
  };

  const previewUrl = selected
    ? API(`/admin/campaigns/${selected.day}/preview?name=John`)
    : "";

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: list */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">30-day drip sequence · {campaigns.filter((c) => c.isCustomized).length} customised</p>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            campaigns.map((c) => (
              <button
                key={c.day}
                onClick={() => openTemplate(c.day)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${selected?.day === c.day ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground w-10 shrink-0">
                    Day {c.day}
                  </span>
                  {DAY_LABELS[c.day] && (
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {DAY_LABELS[c.day]}
                    </span>
                  )}
                  {c.isCustomized && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Edited
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{c.subject}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: detail / editor */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!selected && !loadingDetail && (
          <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
            <div className="text-center">
              <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Select an email from the list to view or edit it</p>
            </div>
          </div>
        )}

        {loadingDetail && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {selected && !loadingDetail && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header bar */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">Day {selected.day}</span>
                  {DAY_LABELS[selected.day] && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{DAY_LABELS[selected.day]}</span>
                  )}
                  {selected.isCustomized && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Customised</span>
                  )}
                  {saveSuccess && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!editing && (
                  <>
                    {selected.isCustomized && (
                      <Button variant="outline" size="sm" onClick={resetToDefault} disabled={resetting}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        {resetting ? "Resetting…" : "Reset to Default"}
                      </Button>
                    )}
                    <Button size="sm" onClick={startEditing}>
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </>
                )}
                {editing && (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={save} disabled={saving}>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Subject line */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Subject Line
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Email subject line…"
                />
              ) : (
                <div className="px-3 py-2 text-sm bg-muted/40 rounded-md border border-border text-foreground">
                  {selected.subject}
                </div>
              )}
            </div>

            {/* Toggle: preview / code */}
            <div className="flex items-center gap-1 mb-3 border-b border-border pb-2">
              <button
                onClick={() => setPreviewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${previewMode === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setPreviewMode("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${previewMode === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                HTML
              </button>
              {editing && previewMode === "code" && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">{"{{firstName}}"}</code> where the recipient's name should appear
                </span>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 rounded-lg border border-border overflow-hidden">
              {previewMode === "preview" && (
                <iframe
                  key={`${selected.day}-${previewKey.current}`}
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0 bg-white"
                  title={`Email preview for day ${selected.day}`}
                  sandbox="allow-same-origin"
                />
              )}
              {previewMode === "code" && (
                <textarea
                  value={editing ? editBodyHtml : selected.bodyHtml}
                  onChange={(e) => editing && setEditBodyHtml(e.target.value)}
                  readOnly={!editing}
                  className={`w-full h-full p-4 text-xs font-mono resize-none focus:outline-none bg-background text-foreground leading-relaxed ${!editing ? "opacity-70 cursor-default" : ""}`}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
