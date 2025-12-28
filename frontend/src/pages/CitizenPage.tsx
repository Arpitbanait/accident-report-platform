import { useEffect, useState } from "react";
import IncidentForm from "../components/IncidentForm";
import IncidentList from "../components/IncidentList";
import MapView from "../components/MapView";
import AuthPanel from "../components/AuthPanel";
import { Incident, Severity, Status } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_URL = API_BASE.replace("http", "ws") + "/ws/incidents";

const statusOrder: Status[] = ["reported", "in_progress", "resolved"];
const severityOrder: Severity[] = ["high", "medium", "low"];

function sortIncidents(list: Incident[]) {
  return [...list].sort((a, b) => {
    const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
    if (severityDiff !== 0) return severityDiff;
    const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error("Failed to load incidents");
  return res.json();
}

interface CitizenPageProps {
  onSwitchToResponder: () => void;
}

export default function CitizenPage({ onSwitchToResponder }: CitizenPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    fetchIncidents()
      .then(setIncidents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data);
        if (parsed.event === "incident_created") {
          setIncidents((prev) => sortIncidents([...prev, parsed.data as Incident]));
        } else if (parsed.event === "incident_updated") {
          setIncidents((prev) =>
            sortIncidents(prev.map((i) => (i.id === parsed.data.id ? parsed.data : i)))
          );
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };
    return () => ws.close();
  }, []);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const createIncident = async (payload: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    media_url?: string;
    severity: Severity;
  }) => {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create incident");
    return res.json();
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: "POST",
      headers: { ...authHeaders },
      body: form,
    });
    if (!res.ok) throw new Error("Failed to upload media");
    const data = await res.json();
    return data.url as string;
  };

  const handleCreate = async (payload: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    media_url?: string;
    severity: Severity;
  }) => {
    const created = await createIncident(payload as any);
    setIncidents((prev) => sortIncidents([...prev, created]));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Citizen Portal</p>
            <h1 className="text-2xl font-bold text-slate-900">Report an Incident</h1>
          </div>
          <div className="text-right">
            {role && (
              <button
                onClick={onSwitchToResponder}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch to Responder Portal
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Report an incident</h2>
            <IncidentForm onSubmit={handleCreate} onUpload={uploadMedia} />
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Authentication</h2>
            <AuthPanel
              apiBase={API_BASE}
              onAuthenticated={(tk, rl) => {
                setToken(tk);
                setRole(rl);
              }}
            />
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">Live feed</h2>
              {loading ? <span className="text-sm text-slate-500">Loading…</span> : null}
              {error ? <span className="text-sm text-red-500">{error}</span> : null}
            </div>
            <IncidentList incidents={incidents} />
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Map preview</h2>
            <MapView incidents={incidents} />
          </div>
        </section>
      </main>
    </div>
  );
}
