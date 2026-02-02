# PfadiMH and hitobito

Type safe TypeScript wrapper for the Hitobito REST API.

## Installation

```bash
bun add @pfadimh/hitobito-api
```


## Development

```bash
bun install
bun test
bun run build
```


## API

- getPerson(id: number): Promise<Person>
- getGroup(id: number): Promise<Group>
- getPeopleInGroup(groupId: number): Promise<Person[]>
- getEventsInGroup(groupId: number): Promise<Event[]>
- getEvent(groupId: number, eventId: number): Promise<Event>
- getSubgroups(groupId: number): Promise<Group[]>
- getRolesForPerson(personId: number): Promise<Role[]>


## Usage

```typescript
import { HitobitoClient } from "@pfadimh/hitobito-api";

const client = new HitobitoClient({
  baseUrl: "https://db.scout.ch",
  token: "THE_TOKEN",
});

const person = await client.getPerson(123);
const group = await client.getGroup(456);
const people = await client.getPeopleInGroup(456);
const events = await client.getEventsInGroup(456);
```



