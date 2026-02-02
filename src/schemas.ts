import { z } from "zod";

export const PersonSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  gender: z.enum(["m", "w"]).nullable().optional(),
  address: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  primary_group_id: z.number().nullable().optional(),
});

export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  short_name: z.string().nullable().optional(),
  type: z.string(),
  parent_id: z.number().nullable().optional(),
  layer_group_id: z.number().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export const EventDateSchema = z.object({
  id: z.number(),
  label: z.string().nullable().optional(),
  start_at: z.string(),
  finish_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const EventSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  motto: z.string().nullable().optional(),
  cost: z.string().nullable().optional(),
  maximum_participants: z.number().nullable().optional(),
  participant_count: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  application_opening_at: z.string().nullable().optional(),
  application_closing_at: z.string().nullable().optional(),
  application_conditions: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  dates: z.array(EventDateSchema).optional().default([]),
  group_ids: z.array(z.number()).optional().default([]),
});

export const RoleSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string().optional(),
  person_id: z.number(),
  group_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
});

export const RolesResponseSchema = z.object({
  roles: z.array(RoleSchema),
});

export const PeopleResponseSchema = z.object({
  people: z.array(PersonSchema),
});

export const GroupResponseSchema = z.object({
  groups: z.array(GroupSchema),
});

export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
});

export const SinglePersonResponseSchema = z.object({
  people: z.array(PersonSchema).length(1),
});

export const SingleGroupResponseSchema = z.object({
  groups: z.array(GroupSchema).length(1),
});

export const SingleEventResponseSchema = z.object({
  events: z.array(EventSchema).length(1),
});
