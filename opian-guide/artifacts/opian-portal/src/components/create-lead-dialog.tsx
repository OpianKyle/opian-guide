import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type LeadForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  notes: string;
};

type CreatedLeadResult = {
  emailSent: boolean;
  emailMessage: string;
};

type CreateLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  onCreated: (result: CreatedLeadResult) => void;
};

const EMPTY_FORM: LeadForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  notes: "",
};

const fields: Array<{
  name: keyof LeadForm;
  label: string;
  type?: string;
  required?: boolean;
}> = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone" },
  { name: "company", label: "Company" },
  { name: "jobTitle", label: "Job Title" },
];

export function CreateLeadDialog({
  open,
  onOpenChange,
  endpoint,
  onCreated,
}: CreateLeadDialogProps) {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !creating) onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, creating, onOpenChange]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sendWelcomeEmail: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not create this lead.");
      }

      setForm(EMPTY_FORM);
      onOpenChange(false);
      onCreated({
        emailSent: result.emailSent === true,
        emailMessage:
          typeof result.emailMessage === "string"
            ? result.emailMessage
            : "Lead created.",
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create this lead.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !creating) onOpenChange(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 id="create-lead-title" className="text-xl font-serif font-bold text-foreground">
            Create New Lead
          </h2>
          <button
            type="button"
            aria-label="Close"
            disabled={creating}
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-6 py-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label
                  htmlFor={`lead-${field.name}`}
                  className="text-sm font-medium text-foreground"
                >
                  {field.label}{field.required ? " *" : ""}
                </label>
                <input
                  id={`lead-${field.name}`}
                  name={field.name}
                  type={field.type || "text"}
                  required={field.required}
                  value={form[field.name]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="lead-notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="lead-notes"
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={creating}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create & Send Email"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
