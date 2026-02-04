import { z } from "zod";

const PersonAttributesSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  birthday: z.string().nullable().optional(),
  gender: z.enum(["m", "w"]).nullable().optional(),
  address: z.string().nullable().optional(),
  zip_code: z.coerce.string().nullable().optional(),
  town: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  primary_group_id: z.coerce.number().nullable().optional(),
});

const GroupAttributesSchema = z.object({
  name: z.string(),
  short_name: z.string().nullable().optional(),
  type: z.string().optional(),
  parent_id: z.coerce.number().nullable().optional(),
  layer_group_id: z.coerce.number().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  zip_code: z.coerce.string().nullable().optional(),
  town: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

const EventAttributesSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  motto: z.string().nullable().optional(),
  cost: z.string().nullable().optional(),
  maximum_participants: z.coerce.number().nullable().optional(),
  participant_count: z.coerce.number().nullable().optional(),
  location: z.string().nullable().optional(),
  application_opening_at: z.string().nullable().optional(),
  application_closing_at: z.string().nullable().optional(),
  application_conditions: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});

const EventDateAttributesSchema = z.object({
  label: z.string().nullable().optional(),
  start_at: z.string(),
  finish_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

const EventRelationshipSchema = z.object({
  dates: z.object({
    data: z.array(z.object({ id: z.coerce.number(), type: z.string() })),
  }).optional(),
  groups: z.object({
    data: z.array(z.object({ id: z.coerce.number(), type: z.string() })),
  }).optional(),
});

const IncludedResourceSchema = z.object({
  id: z.coerce.number(),
  type: z.string(),
  attributes: z.record(z.unknown()),
});

const RoleAttributesSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const PersonSchema = z.object({
  data: z.object({
    id: z.coerce.number(),
    type: z.literal("people"),
    attributes: PersonAttributesSchema,
  }),
}).transform((val) => ({
  id: val.data.id,
  ...val.data.attributes,
}));

export const GroupSchema = z.object({
  data: z.object({
    id: z.coerce.number(),
    type: z.literal("groups"),
    attributes: GroupAttributesSchema,
  }),
}).transform((val) => ({
  id: val.data.id,
  type: val.data.type,
  ...val.data.attributes,
}));

export const EventSchema = z.object({
  data: z.object({
    id: z.coerce.number(),
    type: z.literal("events"),
    attributes: EventAttributesSchema,
    relationships: EventRelationshipSchema.optional(),
  }),
  included: z.array(IncludedResourceSchema).optional(),
}).transform((val) => {
  const group_ids = val.data.relationships?.groups?.data.map((g) => g.id) ?? [];
  const dateIds = new Set(val.data.relationships?.dates?.data.map((d) => d.id) ?? []);
  const dates = (val.included ?? [])
    .filter((inc) => inc.type === "event_dates" && dateIds.has(inc.id))
    .map((inc) => ({
      id: inc.id,
      ...EventDateAttributesSchema.parse(inc.attributes),
    }));

  return {
    id: val.data.id,
    ...val.data.attributes,
    dates,
    group_ids,
  };
});

export const PeopleResponseSchema = z.object({
  data: z.array(z.object({
    id: z.coerce.number(),
    type: z.literal("people"),
    attributes: PersonAttributesSchema,
  })),
}).transform((val) => val.data.map((item) => ({
  id: item.id,
  ...item.attributes,
})));

export const GroupsResponseSchema = z.object({
  data: z.array(z.object({
    id: z.coerce.number(),
    type: z.literal("groups"),
    attributes: GroupAttributesSchema,
  })),
}).transform((val) => val.data.map((item) => ({
  id: item.id,
  type: item.type,
  ...item.attributes,
})));

export const EventsResponseSchema = z.object({
  data: z.array(z.object({
    id: z.coerce.number(),
    type: z.literal("events"),
    attributes: EventAttributesSchema,
    relationships: EventRelationshipSchema.optional(),
  })),
  included: z.array(IncludedResourceSchema).optional(),
}).transform((val) => val.data.map((item) => {
  const group_ids = item.relationships?.groups?.data.map((g) => g.id) ?? [];
  const dateIds = new Set(item.relationships?.dates?.data.map((d) => d.id) ?? []);
  const dates = (val.included ?? [])
    .filter((inc) => inc.type === "event_dates" && dateIds.has(inc.id))
    .map((inc) => ({
      id: inc.id,
      ...EventDateAttributesSchema.parse(inc.attributes),
    }));

  return {
    id: item.id,
    ...item.attributes,
    dates,
    group_ids,
  };
}));

export const RolesResponseSchema = z.object({
  data: z.array(z.object({
    id: z.coerce.number(),
    type: z.literal("roles"),
    attributes: RoleAttributesSchema,
    relationships: z.object({
      person: z.object({
        data: z.object({
          id: z.coerce.number(),
          type: z.literal("people"),
        }).optional(),
      }).optional(),
      group: z.object({
        data: z.object({
          id: z.coerce.number(),
          type: z.literal("groups"),
        }).optional(),
      }).optional(),
    }).optional(),
  })),
}).transform((val) => val.data.map((item) => ({
  id: item.id,
  type: item.attributes.type || "",
  name: item.attributes.name,
  person_id: item.relationships?.person?.data?.id || 0,
  group_id: item.relationships?.group?.data?.id || 0,
  created_at: item.attributes.created_at || "",
  updated_at: item.attributes.updated_at || "",
  deleted_at: item.attributes.deleted_at,
})));


