export interface HitobitoClientConfig {
  baseUrl: string;
  token: string;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  nickname?: string | null;
  email?: string | null;
  birthday?: string | null;
  gender?: "m" | "w" | null;
  address?: string | null;
  zip_code?: string | null;
  town?: string | null;
  country?: string | null;
  primary_group_id?: number | null;
}

export interface Group {
  id: number;
  name: string;
  short_name?: string | null;
  type: string;
  parent_id?: number | null;
  layer_group_id?: number | null;
  email?: string | null;
  address?: string | null;
  zip_code?: string | null;
  town?: string | null;
  country?: string | null;
}

export interface Event {
  id: number;
  name: string;
  description?: string | null;
  motto?: string | null;
  cost?: string | null;
  maximum_participants?: number | null;
  participant_count?: number | null;
  location?: string | null;
  application_opening_at?: string | null;
  application_closing_at?: string | null;
  application_conditions?: string | null;
  state?: string | null;
  dates: EventDate[];
  group_ids: number[];
}

export interface EventDate {
  id: number;
  label?: string | null;
  start_at: string;
  finish_at?: string | null;
  location?: string | null;
}

export interface Role {
  id: number;
  type: string;
  name?: string;
  person_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
