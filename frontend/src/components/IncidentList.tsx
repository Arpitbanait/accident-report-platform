import { Incident } from "../types";

const severityColor: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const statusLabel: Record<string, string> = {
  reported: "Reported",
  in_progress: "In Progress",
  resolved: "Resolved",
};

interface Props {
  incidents: Incident[];
}

export default function IncidentList({ incidents }: Props) {
  if (!incidents.length) {
    return <p className="text-sm text-slate-500">No incidents yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {incidents.map((inc) => (
        <li key={inc.id} className="py-3 flex items-start gap-3">
          <span className={`h-3 w-3 rounded-full mt-1 ${severityColor[inc.severity]}`}></span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800 capitalize">{inc.type.replace("_", " ")}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{statusLabel[inc.status]}</span>
              {inc.is_verified ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Verified</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">Unverified</span>
              )}
              {inc.possible_duplicate_of ? (
                <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700">Possible duplicate</span>
              ) : null}
            </div>
            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{inc.description}</p>
            <p className="text-xs text-slate-500 mt-1">
              {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)} • {new Date(inc.created_at).toLocaleString()}
            </p>
            {inc.media_url ? (
              <a
                className="text-xs text-sky-600 hover:underline"
                href={inc.media_url}
                target="_blank"
                rel="noreferrer"
              >
                Media
              </a>
            ) : null}
            {inc.notes?.length ? (
              <div className="mt-2 space-y-1">
                {inc.notes.map((note) => (
                  <p key={note.id} className="text-xs text-slate-600">
                    <span className="font-semibold">{note.author}:</span> {note.note}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
