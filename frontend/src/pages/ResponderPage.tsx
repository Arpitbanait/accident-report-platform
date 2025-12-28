import { useEffect, useMemo, useState } from "react";
import IncidentList from "../components/IncidentList";
import AdminPanel from "../components/AdminPanel";
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

interface ResponderPageProps {
  onSwitchToCitizen: () => void;
}

export default function ResponderPage({ onSwitchToCitizen }: ResponderPageProps) {
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

  const updateIncident = async (id: string, updates: Partial<Incident> & { note?: string; author?: string }) => {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update incident");
    return res.json();
  };

  const handleAdminUpdate = async (id: string, updates: Partial<Incident> & { note?: string; author?: string }) => {
    const updated = await updateIncident(id, updates);
    setIncidents((prev) => sortIncidents(prev.map((i) => (i.id === updated.id ? updated : i))));
  };

  const verifiedCount = useMemo(() => incidents.filter((i) => i.is_verified).length, [incidents]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-200">Responder Portal</p>
            <h1 className="text-2xl font-bold text-white">Incident Management</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Verified incidents</p>
            <p className="text-lg font-semibold text-blue-50">{verifiedCount}</p>
            {role && (
              <button
                onClick={onSwitchToCitizen}
                className="mt-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Switch to Citizen Portal
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">All Incidents</h2>
              {loading ? <span className="text-sm text-slate-500">Loading…</span> : null}
              {error ? <span className="text-sm text-red-500">{error}</span> : null}
            </div>
            <IncidentList incidents={incidents} />
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4 border border-slate-200 h-fit">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Controls</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Authentication</h3>
                <AuthPanel
                  apiBase={API_BASE}
                  onAuthenticated={(tk, rl) => {
                    setToken(tk);
                    setRole(rl);
                  }}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Manage Incident</h3>
                <AdminPanel incidents={incidents} onUpdate={handleAdminUpdate} token={token} role={role} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Map View</h2>
            <MapView incidents={incidents} />
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 border border-slate-200">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Stats</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Total:</span> {incidents.length}</p>
              <p><span className="font-semibold">Verified:</span> {verifiedCount}</p>
              <p>
                <span className="font-semibold">Active:</span>{" "}
                {incidents.filter((i) => i.status === "in_progress").length}
              </p>
              <p>
                <span className="font-semibold">Resolved:</span>{" "}
                {incidents.filter((i) => i.status === "resolved").length}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
