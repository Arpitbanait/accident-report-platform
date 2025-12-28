import { Incident } from "../types";

interface Props {
  incidents: Incident[];
}

// Simple projected map box for demo purposes only.
export default function MapView({ incidents }: Props) {
  return (
    <div className="relative h-80 rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-200">
          <span>Live pins</span>
          <span>{incidents.length} active</span>
        </div>
        <div className="relative flex-1 border border-slate-600 rounded-md overflow-hidden bg-slate-800/40">
          {incidents.map((inc) => {
            const top = 50 - (inc.latitude % 1) * 50; // crude scatter for demo
            const left = 50 + (inc.longitude % 1) * 50;
            const color = inc.severity === "high" ? "bg-red-400" : inc.severity === "medium" ? "bg-amber-300" : "bg-emerald-300";
            return (
              <div
                key={inc.id}
                className={`absolute h-3 w-3 rounded-full shadow-lg ${color}`}
                style={{ top: `${Math.abs(top)}%`, left: `${Math.abs(left)}%` }}
                title={`${inc.type} • ${inc.severity}`}
              ></div>
            );
          })}
        </div>
        <div className="text-xs text-slate-200 flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400"></span>High</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300"></span>Medium</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-300"></span>Low</span>
        </div>
      </div>
    </div>
  );
}
