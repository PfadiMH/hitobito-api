import { describe, it, expect, vi, beforeEach } from "vitest";
import { HitobitoClient } from "../src/client.js";
import { UnauthorizedError, NotFoundError, RateLimitError } from "../src/errors.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("HitobitoClient", () => {
  let client: HitobitoClient;

  beforeEach(() => {
    client = new HitobitoClient({
      baseUrl: "https://db.scout.ch",
      token: "test-token",
    });
    mockFetch.mockReset();
  });

  describe("getPerson", () => {
    it("returns person data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            id: "1",
            type: "people",
            attributes: { first_name: "Max", last_name: "Muster" },
          },
        }),
      });

      const person = await client.getPerson(1);

      expect(person.id).toBe(1);
      expect(person.first_name).toBe("Max");
      expect(person.last_name).toBe("Muster");
    });

    it("throws UnauthorizedError on 401", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(client.getPerson(1)).rejects.toThrow(UnauthorizedError);
    });

    it("throws NotFoundError on 404", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(client.getPerson(1)).rejects.toThrow(NotFoundError);
    });

    it("throws RateLimitError on 429", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

      await expect(client.getPerson(1)).rejects.toThrow(RateLimitError);
    });
  });

  describe("getGroup", () => {
    it("returns group data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            id: "1",
            type: "groups",
            attributes: { name: "Test Group", short_name: "TG" },
          },
        }),
      });

      const group = await client.getGroup(1);

      expect(group.id).toBe(1);
      expect(group.name).toBe("Test Group");
    });
  });

  describe("getPeopleInGroup", () => {
    it("returns list of people", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: [
            { id: "1", type: "people", attributes: { first_name: "Max", last_name: "Muster" } },
            { id: "2", type: "people", attributes: { first_name: "Anna", last_name: "Test" } },
          ],
        }),
      });

      const people = await client.getPeopleInGroup(1);

      expect(people).toHaveLength(2);
      expect(people[0]?.first_name).toBe("Max");
      expect(people[1]?.first_name).toBe("Anna");
    });
  });

  describe("getEventsInGroup", () => {
    it("returns list of events", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: [
            { id: "1", type: "events", attributes: { name: "Lager" } },
          ],
        }),
      });

      const events = await client.getEventsInGroup(1);

      expect(events).toHaveLength(1);
      expect(events[0]?.name).toBe("Lager");
    });
  });

  describe("getSubgroups", () => {
    it("returns list of subgroups", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: [
            { id: "2", type: "groups", attributes: { name: "Child 1", parent_id: 1 } },
            { id: "3", type: "groups", attributes: { name: "Child 2", parent_id: 1 } },
          ],
        }),
      });

      const subgroups = await client.getSubgroups(1);

      expect(subgroups).toHaveLength(2);
      expect(subgroups[0]?.name).toBe("Child 1");
      expect(subgroups[1]?.name).toBe("Child 2");
    });

    it("returns empty array when no subgroups exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });

      const subgroups = await client.getSubgroups(1);

      expect(subgroups).toHaveLength(0);
    });
  });

  describe("getRolesForPerson", () => {
    it("returns list of roles", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: [
            {
              id: "1",
              type: "roles",
              attributes: {
                type: "GroupAdmin",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
              },
            },
            {
              id: "2",
              type: "roles",
              attributes: {
                type: "Member",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
              },
            },
          ],
        }),
      });

      const roles = await client.getRolesForPerson(123);

      expect(roles).toHaveLength(2);
      expect(roles[0]?.type).toBe("GroupAdmin");
      expect(roles[1]?.type).toBe("Member");
    });

    it("sends correct filter query parameter", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });

      await client.getRolesForPerson(123);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/roles?filter[person_id]=123",
        expect.any(Object)
      );
    });
  });

  describe("getEvent", () => {
    it("returns event data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            id: "1",
            type: "events",
            attributes: { name: "Sommerlager" },
          },
        }),
      });

      const event = await client.getEvent(1, 1);

      expect(event.id).toBe(1);
      expect(event.name).toBe("Sommerlager");
    });
  });

  describe("authentication", () => {
    it("sends X-Token header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            id: "1",
            type: "people",
            attributes: { first_name: "Test", last_name: "User" },
          },
        }),
      });

      await client.getPerson(1);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/people/1",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Token": "test-token",
          }),
        })
      );
    });
  });
});
