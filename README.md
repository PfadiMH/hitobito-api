# pfadimh/hitobito-api 

A type-safe TypeScript wrapper for the [Hitobito](https://github.com/hitobito/hitobito) REST API. It provides a client to read and write data from any Hitobito instance using the JSON:API format, with full runtime validation via Zod.

### Helpful Documentation

- **[Hitobito](https://github.com/hitobito/hitobito)**: The open-source membership management platform.
- **[Hitobito PBS](https://github.com/hitobito/hitobito_pbs)**: The Pfadi-specific Hitobito wagon.
- **[JSON:API Schema](https://pbs.puzzle.ch/api/schema)**: The API schema used by this library.

## Table of Contents

- [Getting Started](#getting-started)
  - [Installation](#installation)
- [API Reference](#api-reference)
  - [Single Resource](#single-resource)
  - [List Resources](#list-resources)
- [Development](#development)
- [Project Structure](#project-structure)

## Getting Started

### Installation

Install the package using Bun.

```bash
bun add @pfadimh/hitobito-api
```

## API Reference

### Single Resource

Fetch a single resource by its ID.

| Method | Returns |
| --- | --- |
| getPerson(id) | Person |
| getGroup(id) | Group |
| getEvent(id) | Event |
| getRole(id) | Role |
| getInvoice(id) | Invoice |
| getMailingList(id) | MailingList |
| getEventKind(id) | EventKind |
| getEventKindCategory(id) | EventKindCategory |

### List Resources

Fetch lists of resources with optional filtering, sorting and pagination. All list methods accept an optional options object with filter, sort, page and per_page. See [src/types.ts](src/types.ts) for available filter fields and sort keys per resource.

| Method | Returns |
| --- | --- |
| getPeople(options?) | Person[] |
| getGroups(options?) | Group[] |
| getEvents(options?) | Event[] |
| getRoles(options?) | Role[] |
| getInvoices(options?) | Invoice[] |
| getMailingLists(options?) | MailingList[] |
| getEventKinds(options?) | EventKind[] |
| getEventKindCategories(options?) | EventKindCategory[] |

## Development

Clone the repository and install dependencies.

```bash
git clone https://github.com/PfadiMH/hitobito-api.git
cd hitobito-api
bun install
```

Run tests, type checking and build.

```bash
bun test
bun run typecheck
bun run build
```

## Project Structure

```
hitobito-api/
├── src/
│   ├── index.ts       
│   ├── client.ts     
│   ├── types.ts       
│   ├── schemas.ts     
│   └── errors.ts      
├── tests/
│   └── client.test.ts # Unit tests (mocked fetch)
└── package.json
```