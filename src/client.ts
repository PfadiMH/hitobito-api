import {
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors.js";
import {
  EventSchema,
  EventsResponseSchema,
  GroupSchema,
  GroupsResponseSchema,
  PeopleResponseSchema,
  PersonSchema,
  RolesResponseSchema,
} from "./schemas.js";
import type {
  Event,
  Group,
  HitobitoClientConfig,
  Person,
  Role,
} from "./types.js";

export class HitobitoClient {
  private baseUrl: string;
  private token: string;

  constructor(config: HitobitoClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api${path}`, {
      headers: {
        "X-Token": this.token,
        "Accept": "application/json",
        "Content-Type": "application/vnd.api+json",
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedError();
    }

    if (response.status === 403) {
      throw new UnauthorizedError("Forbidden: Access denied");
    }

    if (response.status === 404) {
      throw new NotFoundError();
    }

    if (response.status === 429) {
      throw new RateLimitError();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getPerson(id: number): Promise<Person> {
    const data = await this.request<unknown>(`/people/${id}`);
    const parsed = PersonSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid person response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getGroup(id: number): Promise<Group> {
    const data = await this.request<unknown>(`/groups/${id}`);
    const parsed = GroupSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid group response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getPeopleInGroup(groupId: number): Promise<Person[]> {
    const data = await this.request<unknown>(`/people?filter[primary_group_id]=${groupId}`);
    const parsed = PeopleResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid people response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getEvent(eventId: number): Promise<Event> {
    const data = await this.request<unknown>(`/events/${eventId}`);
    const parsed = EventSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid event response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getEventsInGroup(groupId: number): Promise<Event[]> {
    const data = await this.request<unknown>(`/events?filter[group_id]=${groupId}`);
    const parsed = EventsResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid events response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getSubgroups(groupId: number): Promise<Group[]> {
    const data = await this.request<unknown>(`/groups?filter[parent_id]=${groupId}`);
    const parsed = GroupsResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid groups response: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  async getRolesForPerson(personId: number): Promise<Role[]> {
    const data = await this.request<unknown>(`/roles?filter[person_id]=${personId}`);
    const parsed = RolesResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid roles response: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}
