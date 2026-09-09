import { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2, Mail, Phone, Building2, Filter, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lead = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  advisorId: number | null;
  emailDay: number;
  campaignActive: boolean;
  notes: string | null;
  importBatch: string | null;
  createdAt: string;
  updatedAt: string;
};

type EmailLog = {
  id: number;
  leadId: number;
  day: number;
  subject: string | null;
  status: string;
  error: string | null;
  sentAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  booked: "bg-green-100 text-green-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

function getInitials(lead: Lead) {
  const f = lead.firstName?.[0] || "";
  const l = lead.lastName?.[0] || "";
  return (f + l).toUpperCase() || lead.email[0].toUpperCase();
}

function getDisplayName(lead: Lead) {
  if (lead.firstName || lead.lastName) {
    return [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  }
  return lead.email;
}

const STATUSES = ["all", "new", "contacted", "qualified", "booked", "converted", "lost"];

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "emails">("details");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", notes: "" });
  const [creating, setCreating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const r = await fetch(`/api/admin/leads?${params}`, { credentials: "include" });
      if (r.ok) setLeads(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab("details");
    setEditNotes(lead.notes || "");
    setEmailLogs([]);
  };

  const loadEmails = async (leadId: number) => {
    setEmailLogsLoading(true);
    try {
      const r = await fetch(`/api/admin/leads/${leadId}/emails`, { credentials: "include" });
      if (r.ok) setEmailLogs(await r.json());
    } finally {
      setEmailLogsLoading(false);
    }
  };

  const handleTabChange = (tab: "details" | "notes" | "emails") => {
    setActiveTab(tab);
    if (tab === "emails" && selectedLead) loadEmails(selectedLead.id);
  };

  const updateStatus = async (status: string) => {
    if (!selectedLead) return;
    setUpdatingStatus(true);
    try {
      const r = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        const updated = await r.json();
        setSelectedLead(updated);
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const r = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: editNotes }),
      });
      if (r.ok) {
        const updated = await r.json();
        setSelectedLead(updated);
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE", credentials: "include" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm),
      });
      if (r.ok) {
        setShowCreateForm(false);
        setCreateForm({ firstName: "", lastName: "", email: "", phone: "", company: "", notes: "" });
        fetchLeads();
      }
    } finally {
      setCreating(false);
    }
  };

  const filtered = leads.filter((l) => {
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSearch =
      !search ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      getDisplayName(l).toLowerCase().includes(search.toLowerCase()) ||
      (l.company || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="text-muted-foreground">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchLeads}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Lead
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-card border rounded-xl p-6 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New Lead</h2>
            <button onClick={() => setShowCreateForm(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={createLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "firstName", label: "First Name", placeholder: "Jane" },
              { name: "lastName", label: "Last Name", placeholder: "Smith" },
              { name: "email", label: "Email *", placeholder: "jane@example.com", required: true },
              { name: "phone", label: "Phone", placeholder: "+27 xx xxx xxxx" },
              { name: "company", label: "Company", placeholder: "Acme Ltd" },
            ].map((f) => (
              <div key={f.name} className="space-y-1">
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <input
                  type={f.name === "email" ? "email" : "text"}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={(createForm as Record<string, string>)[f.name]}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes..."
                value={createForm.notes}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Lead"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email, name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") fetchLeads(); }}
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchLeads(); }}
            className="px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">👥</div>
            <div className="font-medium mb-1">No leads found</div>
            <div className="text-sm">Import leads from Google Sheets or create one manually.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {getInitials(lead)}
                        </div>
                        <div className="font-semibold text-foreground leading-tight">{getDisplayName(lead)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {lead.phone}
                        </div>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {lead.company ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{lead.company}</span>
                        </div>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[lead.status] || "bg-muted text-muted-foreground"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="font-medium text-foreground">Day {lead.emailDay} / 30</div>
                        <div className={`mt-0.5 ${lead.campaignActive ? "text-green-600" : "text-muted-foreground"}`}>
                          {lead.campaignActive ? "● Active" : "○ Completed"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openLead(lead)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteLead(lead.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete">
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

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-sidebar p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {getInitials(selectedLead)}
                </div>
                <div>
                  <div className="text-sidebar-foreground font-bold text-lg leading-tight">{getDisplayName(selectedLead)}</div>
                  <div className="text-sidebar-foreground/60 text-sm">{selectedLead.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-b flex">
              {(["details", "notes", "emails"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab}
                  {tab === "emails" && emailLogs.length > 0 && (
                    <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">{emailLogs.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 max-h-80 overflow-y-auto">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phone</div>
                      <div className="text-sm text-foreground">{selectedLead.phone || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Company</div>
                      <div className="text-sm text-foreground">{selectedLead.company || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source</div>
                      <div className="text-sm text-foreground capitalize">{selectedLead.source || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email Campaign</div>
                      <div className="text-sm text-foreground">
                        Day {selectedLead.emailDay} / 30 —{" "}
                        <span className={selectedLead.campaignActive ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {selectedLead.campaignActive ? "Active" : "Completed"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Update Status</div>
                    <div className="flex flex-wrap gap-2">
                      {["new", "contacted", "qualified", "booked", "converted", "lost"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(s)}
                          disabled={updatingStatus}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors border ${selectedLead.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input text-muted-foreground hover:border-primary hover:text-primary"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <Button onClick={saveNotes} disabled={savingNotes} size="sm">
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              )}

              {activeTab === "emails" && (
                <div className="space-y-2">
                  {emailLogsLoading ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
                  ) : emailLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No emails sent yet</div>
                  ) : (
                    emailLogs.map((log) => (
                      <div key={log.id} className={`p-3 rounded-lg border text-sm ${log.status === "sent" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">Day {log.day}</span>
                          <span className={`text-xs font-semibold ${log.status === "sent" ? "text-green-600" : "text-red-600"}`}>{log.status}</span>
                        </div>
                        {log.subject && <div className="text-muted-foreground truncate">{log.subject}</div>}
                        <div className="text-muted-foreground/60 text-xs mt-1">{new Date(log.sentAt).toLocaleString()}</div>
                        {log.error && <div className="text-red-600 text-xs mt-1">{log.error}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
