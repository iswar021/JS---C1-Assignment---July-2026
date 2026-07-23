# UI Flow

Frontend screens and user flows for the Support Ticket Management System (Core).
Design document — defines the screens the frontend (M5) implements.

**Stack:** React + TypeScript + TailwindCSS (Vite). Client-side routing.

## Screen map

```
/                      Ticket List  (search + status filter)
/tickets/new           Create Ticket
/tickets/:id           Ticket Detail (fields, comments, status control)
```

## 1. Ticket List (`/`)

**Purpose:** browse, search, and filter all tickets; entry point to detail/create.

**Layout**
- Header with app title and a **"New Ticket"** button (→ `/tickets/new`).
- **Search/filter bar**: keyword text input (`q`) + status dropdown
  (All / Open / In Progress / Resolved / Closed / Cancelled).
- **Ticket list**: each row shows title, `PriorityBadge`, `StatusBadge`, assignee,
  and updated time. Clicking a row → detail.

**States**
- *Loading*: skeleton/spinner.
- *Error*: message + Retry button (e.g. API unreachable).
- *Empty*: "No tickets match your search/filter."

**Behaviour**
- Typing in search (debounced) and changing the status filter re-query
  `GET /tickets?q=&status=`.
- Status filter maps `In Progress` label → `IN_PROGRESS` value.

## 2. Create Ticket (`/tickets/new`)

**Purpose:** create a new ticket.

**Form fields**
- Title (required)
- Description (required, textarea)
- Priority (select: Low/Medium/High/Urgent)
- Created by (select from seeded users) — stands in for the logged-in user (no auth)
- Assignee (optional select from seeded users)

**States & validation**
- Inline required-field validation before submit (UX).
- On submit → `POST /tickets`. On **400**, show server field errors inline
  (backend is authoritative).
- On success → navigate to the new ticket's detail page.
- Submit button disabled while pending; API error shown at form top.

## 3. Ticket Detail (`/tickets/:id`)

**Purpose:** view/update a ticket, manage status, and discuss via comments.

**Sections**
1. **Header**: title, `StatusBadge`, `PriorityBadge`.
2. **Editable fields**: title, description, priority, assignee → `PATCH /tickets/:id`.
   Inline save with success/error feedback. (Status is **not** editable here.)
3. **Status control** (`StatusChanger`):
   - Offers **only valid next transitions** for the current status (client mirror of
     the state machine) — e.g. `OPEN` shows "Start (In Progress)" and "Cancel".
   - Terminal states (`CLOSED`, `CANCELLED`) show no actions.
   - On action → `PATCH /tickets/:id/status`. A **409** (invalid transition) shows a
     clear message near the control; the ticket state is refetched to resync.
4. **Comments**:
   - `CommentList` (author + message + time), newest last.
   - `CommentForm`: message + author select → `POST /tickets/:id/comments`.
     Empty message blocked client-side and rejected server-side (400).

**States**
- *Loading*: spinner while fetching the ticket.
- *Not found*: 404 → "Ticket not found" with a link back to the list.
- *Error*: transient errors show a retryable message.

## Cross-cutting UI behaviour

- **StatusBadge/PriorityBadge** centralize enum → label + color mapping
  (`IN_PROGRESS` → "In Progress").
- **Error handling**: `api/client.ts` normalizes non-2xx into typed errors; pages
  render field errors, transition errors, or retryable error states accordingly.
- **Accessibility/UX**: buttons show pending state; forms disable during submit;
  destructive/terminal actions (Cancel/Close) are visually distinct.

## Flow diagram

```
[List] --click--> [Detail] --edit fields--> PATCH /tickets/:id
   |                  |--change status----> PATCH /tickets/:id/status --(409)--> show error
   |                  |--add comment------> POST /tickets/:id/comments
   |--"New Ticket"--> [Create] --submit--> POST /tickets --success--> [Detail]
```
