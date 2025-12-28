import { useMemo, useState } from "react";
import { Incident, Severity, Status } from "../types";

interface Props {
  incidents: Incident[];
  onUpdate: (id: string, payload: Partial<Incident> & { note?: string; author?: string }) => Promise<void>;
  token?: string;
  role?: string;
}

const statusLabel: Record<Status, string> = {
  reported: "Reported",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function AdminPanel({ incidents, onUpdate, token, role }: Props) {
  const [selected, setSelected] = useState<string>("");
  const [status, setStatus] = useState<Status>("reported");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [verify, setVerify] = useState(false);
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => incidents.slice(0, 50), [incidents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !token) {
      setError("Select an incident and sign in as admin/responder.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate(selected, { status, severity, is_verified: verify, note: note || undefined, author: author || "Admin" });
      setNote("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Select incident
        <select
          className="border rounded px-3 py-2 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Choose...</option>
          {options.map((i) => (
            <option key={i.id} value={i.id}>
              {i.type} • {statusLabel[i.status]} • {new Date(i.created_at).toLocaleTimeString()}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
        <label className="flex flex-col gap-1">
          Status
          <select className="border rounded px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="reported">Reported</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Severity
          <select className="border rounded px-3 py-2 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} /> Mark as verified
      </label>

      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Internal note (optional)
        <textarea className="border rounded px-3 py-2 text-sm" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Author
        <input className="border rounded px-3 py-2 text-sm" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </label>

      <button
        type="submit"
        disabled={!selected || submitting || !token}
        className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update incident"}
      </button>

      {role ? <p className="text-xs text-emerald-700">Signed in as {role}</p> : <p className="text-xs text-amber-700">Sign in to manage incidents.</p>}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
