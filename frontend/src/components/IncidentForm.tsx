import { useEffect, useState } from "react";
import { Severity } from "../types";

interface Props {
  onSubmit: (payload: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    media_url?: string;
    severity: Severity;
  }) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}

const defaultCoords = { lat: 37.7749, lng: -122.4194 };

export default function IncidentForm({ onSubmit, onUpload }: Props) {
  const [type, setType] = useState("accident");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(defaultCoords);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(defaultCoords)
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let finalMediaUrl = mediaUrl || undefined;
      if (file) {
        finalMediaUrl = await onUpload(file);
      }

      await onSubmit({
        type,
        description,
        severity,
        latitude: coords.lat,
        longitude: coords.lng,
        media_url: finalMediaUrl,
      });
      setDescription("");
      setMediaUrl("");
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm text-slate-700 flex flex-col gap-1">
          Type
          <select
            className="border rounded px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="accident">Accident</option>
            <option value="fire">Fire</option>
            <option value="medical">Medical</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="public_safety">Public Safety</option>
          </select>
        </label>
        <label className="text-sm text-slate-700 flex flex-col gap-1">
          Severity
          <select
            className="border rounded px-3 py-2 text-sm"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Description
        <textarea
          className="border rounded px-3 py-2 text-sm"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
        <label className="flex flex-col gap-1">
          Latitude
          <input
            type="number"
            step="0.000001"
            className="border rounded px-3 py-2 text-sm"
            value={coords.lat}
            onChange={(e) => setCoords((c) => ({ ...c, lat: parseFloat(e.target.value) }))}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          Longitude
          <input
            type="number"
            step="0.000001"
            className="border rounded px-3 py-2 text-sm"
            value={coords.lng}
            onChange={(e) => setCoords((c) => ({ ...c, lng: parseFloat(e.target.value) }))}
            required
          />
        </label>
      </div>

      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Media URL (optional)
        <input
          type="url"
          className="border rounded px-3 py-2 text-sm"
          placeholder="https://..."
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
      </label>

      <label className="text-sm text-slate-700 flex flex-col gap-1">
        Or upload a file
        <input
          type="file"
          accept="image/*,video/*"
          className="border rounded px-3 py-2 text-sm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit incident"}
      </button>
    </form>
  );
}
