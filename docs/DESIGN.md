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
- The thread is shown in stored order, never sorted by `at`: messages are only ever appended, and a wrong clock in one reply must not reorder the conversation.
- Attachments: images and PDF (up to 20 MB, the asset store's limit). ZIP and other files are refused by the asset store; the page says to paste a link instead.

## Token use

Long threads made every check expensive. Flow B therefore downloads only active entries into files (`out_dir`), and `scripts/desk.cjs` prints just the new messages per entry and builds replies from the files, so old threads never pass through the conversation.

## Stage plan

1. Done: statuses above, `urgent` flag (top of list, red), UI language DE/EN switchable per viewer, Claude-created reports, autonomy rule.
2. Several people: who created what (needs viewer identity; fallback: everyone reports and writes, only the owner sets ok/hold/skip), drawing on screenshots (pen, arrow, rectangle, red; original kept). Dictation: only a hint to use the phone keyboard's microphone; own button only if a test shows it works reliably inside claude.ai.
3. Scheduled checks offered at setup (default 08:00 and 18:00; needs the computer on and the Claude app open), desktop notification when Claude asks something, "Rückblick" tab filled every Monday for the previous week (done, new, waiting for you, 2–3 sentences of what changed).

## Not doing

- Report types (Fehler/Wunsch/Frage): the existing text field and tags are enough.
- Priority levels beyond `urgent`: "Später" covers "someday".
