import { describe, it, expect, vi, beforeEach } from "vitest";
import { HitobitoClient } from "../src/client.js";
import { UnauthorizedError, NotFoundError, RateLimitError } from "../src/errors.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: () => Promise.resolve(body),
  };
}

describe("HitobitoClient", () => {
  let client: HitobitoClient;

  beforeEach(() => {
    client = new HitobitoClient({
      baseUrl: "https://db.scout.ch",
      token: "test-token",
    });
    mockFetch.mockReset();
  });

  describe("authentication", () => {
    it("sends X-Token header", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: { id: "1", type: "people", attributes: { first_name: "Test", last_name: "User" } },
      }));

      await client.getPerson(1);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/people/1",
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Token": "test-token" }),
        }),
      );
    });

    it("throws UnauthorizedError on 401", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
      await expect(client.getPerson(1)).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError on 403", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
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

    it("throws generic Error on other status codes", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: "Internal Server Error" });
      await expect(client.getPerson(1)).rejects.toThrow("HTTP 500");
    });
  });

  describe("getPerson", () => {
    it("returns person data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: { id: "1", type: "people", attributes: { first_name: "Max", last_name: "Muster" } },
      }));

      const person = await client.getPerson(1);

      expect(person.id).toBe(1);
      expect(person.first_name).toBe("Max");
      expect(person.last_name).toBe("Muster");
    });
  });

  describe("getGroup", () => {
    it("returns group data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: { id: "1", type: "groups", attributes: { name: "Test Group", short_name: "TG" } },
      }));

      const group = await client.getGroup(1);

      expect(group.id).toBe(1);
      expect(group.name).toBe("Test Group");
    });
  });

  describe("getEvent", () => {
    it("returns event data with dates and group_ids", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "events",
          attributes: { name: "Sommerlager" },
          relationships: {
            dates: { data: [{ id: "10", type: "event_dates" }] },
            groups: { data: [{ id: "5", type: "groups" }] },
          },
        },
        included: [
          { id: "10", type: "event_dates", attributes: { start_at: "2024-07-01T00:00:00Z", finish_at: "2024-07-14T00:00:00Z" } },
        ],
      }));

      const event = await client.getEvent(1);

      expect(event.id).toBe(1);
      expect(event.name).toBe("Sommerlager");
      expect(event.group_ids).toEqual([5]);
      expect(event.dates).toHaveLength(1);
      expect(event.dates[0]?.start_at).toBe("2024-07-01T00:00:00Z");
    });
  });

  describe("getRole", () => {
    it("returns role data from attributes", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "roles",
          attributes: {
            type: "GroupAdmin",
            person_id: 42,
            group_id: 7,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
      }));

      const role = await client.getRole(1);

      expect(role.id).toBe(1);
      expect(role.type).toBe("GroupAdmin");
      expect(role.person_id).toBe(42);
      expect(role.group_id).toBe(7);
    });
  });

  describe("getInvoice", () => {
    it("returns invoice data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "invoices",
          attributes: { title: "Membership Fee", state: "issued", due_at: "2024-12-31" },
        },
      }));

      const invoice = await client.getInvoice(1);

      expect(invoice.id).toBe(1);
      expect(invoice.title).toBe("Membership Fee");
      expect(invoice.state).toBe("issued");
    });
  });

  describe("getMailingList", () => {
    it("returns mailing list data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "mailing_lists",
          attributes: { name: "Newsletter", subscribable: true },
        },
      }));

      const list = await client.getMailingList(1);

      expect(list.id).toBe(1);
      expect(list.name).toBe("Newsletter");
      expect(list.subscribable).toBe(true);
    });
  });

  describe("getEventKind", () => {
    it("returns event kind data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "event_kinds",
          attributes: { label: "Camp", short_name: "C" },
        },
      }));

      const kind = await client.getEventKind(1);

      expect(kind.id).toBe(1);
      expect(kind.label).toBe("Camp");
      expect(kind.short_name).toBe("C");
    });
  });

  describe("getEventKindCategory", () => {
    it("returns event kind category data", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "event_kind_categories",
          attributes: { label: "Youth", order: 1 },
        },
      }));

      const cat = await client.getEventKindCategory(1);

      expect(cat.id).toBe(1);
      expect(cat.label).toBe("Youth");
      expect(cat.order).toBe(1);
    });
  });

  describe("getPeople", () => {
    it("returns list of people without options", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "1", type: "people", attributes: { first_name: "Max", last_name: "Muster" } },
          { id: "2", type: "people", attributes: { first_name: "Anna", last_name: "Test" } },
        ],
      }));

      const people = await client.getPeople();

      expect(people).toHaveLength(2);
      expect(people[0]?.first_name).toBe("Max");
      expect(people[1]?.first_name).toBe("Anna");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/people",
        expect.any(Object),
      );
    });

    it("applies filter query params", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getPeople({ filter: { primary_group_id: 5 } });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("filter%5Bprimary_group_id%5D=5");
    });

    it("applies multiple filters", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getPeople({ filter: { primary_group_id: 42, gender: "w" } });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("filter%5Bprimary_group_id%5D=42");
      expect(url).toContain("filter%5Bgender%5D=w");
    });

    it("applies sort query param", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getPeople({ sort: "last_name" });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("sort=last_name");
    });

    it("applies pagination params", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getPeople({ page: 2, per_page: 25 });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("page%5Bnumber%5D=2");
      expect(url).toContain("page%5Bsize%5D=25");
    });

    it("applies combined options", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getPeople({
        filter: { primary_group_id: 3 },
        sort: "last_name",
        page: 1,
        per_page: 10,
      });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("filter%5Bprimary_group_id%5D=3");
      expect(url).toContain("sort=last_name");
      expect(url).toContain("page%5Bnumber%5D=1");
      expect(url).toContain("page%5Bsize%5D=10");
    });
  });

  describe("getGroups", () => {
    it("returns list of groups with filter", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "2", type: "groups", attributes: { name: "Child 1", parent_id: 1 } },
          { id: "3", type: "groups", attributes: { name: "Child 2", parent_id: 1 } },
        ],
      }));

      const groups = await client.getGroups({ filter: { parent_id: 1 } });

      expect(groups).toHaveLength(2);
      expect(groups[0]?.name).toBe("Child 1");
      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("filter%5Bparent_id%5D=1");
    });

    it("returns empty array when no groups match", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      const groups = await client.getGroups({ filter: { parent_id: 999 } });

      expect(groups).toHaveLength(0);
    });
  });

  describe("getEvents", () => {
    it("returns list of events with filter and dates", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: "1",
            type: "events",
            attributes: { name: "Lager" },
            relationships: {
              dates: { data: [{ id: "10", type: "event_dates" }] },
              groups: { data: [{ id: "1", type: "groups" }] },
            },
          },
        ],
        included: [
          { id: "10", type: "event_dates", attributes: { start_at: "2024-07-01T00:00:00Z" } },
        ],
      }));

      const events = await client.getEvents({ filter: { group_id: 1 } });

      expect(events).toHaveLength(1);
      expect(events[0]?.name).toBe("Lager");
      expect(events[0]?.group_ids).toEqual([1]);
      expect(events[0]?.dates).toHaveLength(1);
    });
  });

  describe("getRoles", () => {
    it("returns list of roles with person_id from attributes", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: "1",
            type: "roles",
            attributes: {
              type: "GroupAdmin",
              person_id: 123,
              group_id: 7,
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          },
          {
            id: "2",
            type: "roles",
            attributes: {
              type: "Member",
              person_id: 123,
              group_id: 7,
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          },
        ],
      }));

      const roles = await client.getRoles({ filter: { person_id: 123 } });

      expect(roles).toHaveLength(2);
      expect(roles[0]?.type).toBe("GroupAdmin");
      expect(roles[0]?.person_id).toBe(123);
      expect(roles[0]?.group_id).toBe(7);
      expect(roles[1]?.type).toBe("Member");
    });

    it("sends correct filter query parameter", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

      await client.getRoles({ filter: { person_id: 123 } });

      const url = mockFetch.mock.calls[0]![0] as string;
      expect(url).toContain("filter%5Bperson_id%5D=123");
    });
  });

  describe("getInvoices", () => {
    it("returns list of invoices with filter", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "1", type: "invoices", attributes: { title: "Fee 2024", state: "issued" } },
        ],
      }));

      const invoices = await client.getInvoices({ filter: { group_id: 5 } });

      expect(invoices).toHaveLength(1);
      expect(invoices[0]?.title).toBe("Fee 2024");
    });
  });

  describe("getMailingLists", () => {
    it("returns list of mailing lists", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "1", type: "mailing_lists", attributes: { name: "Newsletter" } },
          { id: "2", type: "mailing_lists", attributes: { name: "Updates" } },
        ],
      }));

      const lists = await client.getMailingLists({ filter: { group_id: 1 } });

      expect(lists).toHaveLength(2);
      expect(lists[0]?.name).toBe("Newsletter");
    });
  });

  describe("getEventKinds", () => {
    it("returns list of event kinds", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "1", type: "event_kinds", attributes: { label: "Camp" } },
          { id: "2", type: "event_kinds", attributes: { label: "Course" } },
        ],
      }));

      const kinds = await client.getEventKinds();

      expect(kinds).toHaveLength(2);
      expect(kinds[0]?.label).toBe("Camp");
    });
  });

  describe("getEventKindCategories", () => {
    it("returns list of event kind categories", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: [
          { id: "1", type: "event_kind_categories", attributes: { label: "Youth", order: 1 } },
        ],
      }));

      const cats = await client.getEventKindCategories();

      expect(cats).toHaveLength(1);
      expect(cats[0]?.label).toBe("Youth");
      expect(cats[0]?.order).toBe(1);
    });
  });

  describe("updatePerson", () => {
    it("sends PATCH with JSON:API body and returns updated person", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "1",
          type: "people",
          attributes: { first_name: "Updated", last_name: "Muster" },
        },
      }));

      const person = await client.updatePerson(1, { first_name: "Updated" });

      expect(person.first_name).toBe("Updated");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/people/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            data: { id: "1", type: "people", attributes: { first_name: "Updated" } },
          }),
        }),
      );
    });
  });

  describe("createRole", () => {
    it("sends POST with JSON:API body and returns created role", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "10",
          type: "roles",
          attributes: {
            type: "Member",
            person_id: 42,
            group_id: 7,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
      }));

      const role = await client.createRole({ type: "Member", person_id: 42, group_id: 7 });

      expect(role.id).toBe(10);
      expect(role.type).toBe("Member");
      expect(role.person_id).toBe(42);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/roles",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            data: { type: "roles", attributes: { type: "Member", person_id: 42, group_id: 7 } },
          }),
        }),
      );
    });
  });

  describe("updateRole", () => {
    it("sends PATCH with JSON:API body and returns updated role", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "5",
          type: "roles",
          attributes: {
            type: "GroupAdmin",
            person_id: 42,
            group_id: 7,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-06-01T00:00:00Z",
          },
        },
      }));

      const role = await client.updateRole(5, { type: "GroupAdmin" });

      expect(role.type).toBe("GroupAdmin");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/roles/5",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            data: { id: "5", type: "roles", attributes: { type: "GroupAdmin" } },
          }),
        }),
      );
    });
  });

  describe("deleteRole", () => {
    it("sends DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

      await client.deleteRole(5);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/roles/5",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("updateInvoice", () => {
    it("sends PATCH with JSON:API body and returns updated invoice", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        data: {
          id: "3",
          type: "invoices",
          attributes: { title: "Updated Fee", state: "issued" },
        },
      }));

      const invoice = await client.updateInvoice(3, { title: "Updated Fee" });

      expect(invoice.title).toBe("Updated Fee");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://db.scout.ch/api/invoices/3",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            data: { id: "3", type: "invoices", attributes: { title: "Updated Fee" } },
          }),
        }),
      );
    });
  });
});
