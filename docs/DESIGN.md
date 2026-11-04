# Feedback Desk – design decisions

Settled with the first user, a non-developer building an app with Claude, in October 2026. This file is for whoever develops the skill further; Claude does not need it to run the flows in SKILL.md.

## Audience and principle

- For people without programming experience who build with Claude; teams later.
- Simple, but thought through: clean up rather than pile on.

## Status

`""` Offen → `doing` In Arbeit → `review` Bitte prüfen → `ok` Erledigt, plus `hold` Pausiert and `skip` Später.

- `doing`: set by Claude when it starts, or by a person ("stays active"). Claude continues these first.
- `review`: set by Claude after a change, with preview link and click path in the thread.
- `ok`: only a person. Stage 2: the person who created the entry, or the owner.
- `hold`, `skip`: Claude leaves them alone.
- Legacy codes from older copies: `fail` → `""`, `block` → `skip` (the page maps them on read).

## Claude's autonomy

- Small things directly: texts, colours, spacing, obvious bugs. Everything else: ask first. A project may override this rule in its own notes.
- Claude may create a few reports itself (`from: "claude"`), shown with a "von Claude" marker.
- Tags belong to people.

## Page details

- Filters and tags are multi-select (an entry shows if it matches any selected one); "Alle" clears.
- The thread is shown by `seq`, never sorted by `at`: a wrong clock in one reply must not reorder the conversation.
- Attachments: images and PDF (up to 20 MB, the asset store's limit). ZIP and other files are refused by the asset store; the page says to paste a link instead.
- Read/unread: per entry the number of messages a person has seen; unread = a Claude message after that. Shown as bold title, accent edge and a "new" pill; filter "Unread", "Mark all read", "Mark as unread" in a report. Stored in the person's private `data/users/<id>` subtree so it matches across devices, with the browser as fallback.
- To-dos: one button asks Claude (from the page, `sample`) to turn the active threads into a list of what the PERSON must do (merge, run a migration, check, answer, decide), duplicates merged into one item with all report refs. Ticks persist; on refresh done items stay done, new ones are added, outdated open ones drop out. Counts against the viewer's own Claude plan, no extra service.

## Token use and message storage

Long threads made every check expensive, and a reply had to send the whole thread back. Since November 2026 the tools also no longer read into or write from files. So every message is its own document in `messages`, ordered by `seq`, and `checks` holds only short data plus `lastBy`, `lastAt` and `count`.

- Claude finds work with one query on `lastBy` and `status`, reads the last few messages per entry and writes one message plus the short data in one call that applies both or neither.
- `seq` sets the order, so a wrong clock cannot reorder a conversation.
- The database guidance warns against one document per item for endless streams. Feedback stays far below the limits (25,000 documents, 100 MB), so this is fine here.
- The page moves old threads itself when someone with edit access opens it: first a copy in `backup`, then the messages under fixed ids, then it empties the old fields. An interruption is harmless, it continues on the next visit. `meta/desk` with `format: 2` marks the end.

## Stage plan

1. Done: statuses above, `urgent` flag (top of list, red), UI language DE/EN switchable per viewer, Claude-created reports, autonomy rule.
2. Several people: who created what (needs viewer identity; fallback: everyone reports and writes, only the owner sets ok/hold/skip), drawing on screenshots (pen, arrow, rectangle, red; original kept). Dictation: only a hint to use the phone keyboard's microphone; own button only if a test shows it works reliably inside claude.ai.
3. Scheduled checks offered at setup (default 08:00 and 18:00; needs the computer on and the Claude app open), desktop notification when Claude asks something, "Rückblick" tab filled every Monday for the previous week (done, new, waiting for you, 2–3 sentences of what changed).

## Not doing

- Report types (Fehler/Wunsch/Frage): the existing text field and tags are enough.
- Priority levels beyond `urgent`: "Später" covers "someday".
