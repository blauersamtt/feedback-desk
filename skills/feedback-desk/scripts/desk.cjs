#!/usr/bin/env node
// Feedback Desk helper: works on the JSON files that `ArtifactData` (query with out_dir) saved,
// so long threads never have to pass through the conversation.
//
//   node desk.cjs todo  <dir>                               what needs an answer, only the new part of each thread
//   node desk.cjs reply <dir> <docId> <textFile> [status]   writes <dir>/patch-<docId>.json for an `update` with file_path
//
// <dir> is the out_dir given to ArtifactData; the documents are in <dir>/checks/<docId>.json.
const fs = require("fs");
const path = require("path");

const [cmd, dir, ...rest] = process.argv.slice(2);
if (!cmd || !dir) {
  console.error("usage: desk.cjs todo <dir> | desk.cjs reply <dir> <docId> <textFile> [status]");
  process.exit(2);
}
const checksDir = path.join(dir, "checks");
const ACTIVE = ["", "doing", "review"];
const normStatus = (s) => (s === "fail" ? "" : s === "block" ? "skip" : s || "");
const load = (docId) => JSON.parse(fs.readFileSync(path.join(checksDir, docId + ".json"), "utf8"));
const label = (d) => (d.kind === "report" ? (typeof d.no === "number" ? "M-" + String(d.no).padStart(3, "0") : d.item) : d.item);
const short = (s, n) => { const t = String(s || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n) + " …" : t; };
// The thread is stored in the order messages were written; `at` may be wrong, so never sort by it.
const threadOf = (d) => (Array.isArray(d.thread) ? d.thread : []);

if (cmd === "todo") {
  const docs = fs.readdirSync(checksDir).filter((f) => f.endsWith(".json")).map((f) => ({ docId: f.slice(0, -5), d: load(f.slice(0, -5)) }));
  const todo = [], quiet = [];
  for (const { docId, d } of docs) {
    const thread = threadOf(d);
    const last = thread[thread.length - 1];
    const st = normStatus(d.status);
    if (last && last.by === "user" && ACTIVE.includes(st)) todo.push({ docId, d, thread, st });
    else if (ACTIVE.includes(st)) quiet.push(label(d));
  }
  const rank = (x) => (x.d.urgent ? 0 : x.st === "doing" ? 1 : 2);
  todo.sort((a, b) => rank(a) - rank(b) || String(a.thread[a.thread.length - 1].at).localeCompare(String(b.thread[b.thread.length - 1].at)));
  console.log(`TO DO: ${todo.length}` + (quiet.length ? ` · waiting for the person (skip): ${quiet.join(", ")}` : ""));
  for (const { docId, d, thread, st } of todo) {
    let lastClaude = -1;
    thread.forEach((m, i) => { if (m.by === "claude") lastClaude = i; });
    const fresh = thread.slice(lastClaude + 1);
    console.log("\n=== " + label(d) + " · " + (d.title || "") + " ===");
    console.log(`doc ${docId} · status "${st}"` + (d.urgent ? " · URGENT" : "") + (d.area ? " · " + d.area : "") + ((d.tags || []).length ? " · #" + d.tags.join(" #") : "") + ` · ${thread.length} messages`);
    if (lastClaude >= 0) console.log(`[earlier: ${lastClaude} messages not shown] Claude's last answer: ${short(thread[lastClaude].text, 400)}`);
    for (const m of fresh) {
      console.log(`--- person ${m.at || ""}:\n${m.text || "(no text)"}`);
      if ((m.shots || []).length) console.log("attachments: " + m.shots.map((s) => (s.type === "pdf" ? `${s.id} (PDF "${s.name || ""}")` : s.id)).join(", "));
    }
  }
  console.log("\nVersions for if_version are in the ArtifactData result. Full thread if needed: Read <dir>/checks/<doc>.json.");
} else if (cmd === "reply") {
  const [docId, textFile, status] = rest;
  if (!docId || !textFile) { console.error("reply needs <docId> <textFile>"); process.exit(2); }
  if (status === "ok") { console.error("Claude never sets status ok"); process.exit(2); }
  if (status !== undefined && !["", "doing", "review"].includes(status)) { console.error("status must be \"\", doing or review"); process.exit(2); }
  const d = load(docId);
  const now = new Date().toISOString();
  const msg = { id: "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), by: "claude", at: now, text: fs.readFileSync(textFile, "utf8").trim(), shots: [] };
  const patch = { thread: [...threadOf(d), msg], updatedAt: now };
  if (status !== undefined) patch.status = status;
  const out = path.join(dir, "patch-" + docId + ".json");
  fs.writeFileSync(out, JSON.stringify(patch));
  console.log(out);
} else {
  console.error("unknown command " + cmd);
  process.exit(2);
}
