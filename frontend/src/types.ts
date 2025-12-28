export type Severity = "low" | "medium" | "high";
export type Status = "reported" | "in_progress" | "resolved";

export interface Incident {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  media_url?: string | null;
  severity: Severity;
  status: Status;
  is_verified: boolean;
  possible_duplicate_of?: string | null;
  created_at: string;
  updated_at: string;
  notes: IncidentNote[];
}

export interface IncidentNote {
  id: string;
  note: string;
  author: string;
  created_at: string;
}
