import {
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors.js";
import {
  EventsResponseSchema,
  GroupResponseSchema,
  PeopleResponseSchema,
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
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "X-Token": this.token,
        "Accept": "application/json",
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedError();
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
    const data = await this.request<unknown>(`/people/${id}.json`);
    const parsed = PeopleResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid person response: ${parsed.error.message}`);
    }

    const person = parsed.data.people[0];
    if (!person) {
      throw new NotFoundError(`Person ${id} not found`);
    }

    return person;
  }

  async getGroup(id: number): Promise<Group> {
    const data = await this.request<unknown>(`/groups/${id}.json`);
    const parsed = GroupResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid group response: ${parsed.error.message}`);
    }

    const group = parsed.data.groups[0];
    if (!group) {
      throw new NotFoundError(`Group ${id} not found`);
    }

    return group;
  }

  async getPeopleInGroup(groupId: number): Promise<Person[]> {
    const data = await this.request<unknown>(`/groups/${groupId}/people.json`);
    const parsed = PeopleResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid people response: ${parsed.error.message}`);
    }

    return parsed.data.people;
  }

  async getEvent(groupId: number, eventId: number): Promise<Event> {
    const data = await this.request<unknown>(`/groups/${groupId}/events/${eventId}.json`);
    const parsed = EventsResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid event response: ${parsed.error.message}`);
    }

    const event = parsed.data.events[0];
    if (!event) {
      throw new NotFoundError(`Event ${eventId} not found`);
    }

    return event;
  }

  async getEventsInGroup(groupId: number): Promise<Event[]> {
    const data = await this.request<unknown>(`/groups/${groupId}/events.json`);
    const parsed = EventsResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid events response: ${parsed.error.message}`);
    }

    return parsed.data.events;
  }

  async getSubgroups(groupId: number): Promise<Group[]> {
    const data = await this.request<unknown>(`/groups/${groupId}.json`);
    const parsed = GroupResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid group response: ${parsed.error.message}`);
    }

    return parsed.data.groups.filter((group) => group.parent_id === groupId);
  }

  async getRolesForPerson(personId: number): Promise<Role[]> {
    const data = await this.request<unknown>(
      `/roles.json?filter[person_id]=${personId}`
    );
    const parsed = RolesResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ValidationError(`Invalid roles response: ${parsed.error.message}`);
    }

    return parsed.data.roles;
  }
}
