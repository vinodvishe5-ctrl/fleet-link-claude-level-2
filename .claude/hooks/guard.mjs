#!/usr/bin/env node
/**
 * FleetLink guardrail hook (Module 2.F) — deterministic enforcement of the CLAUDE.md sandbox rule:
 *   "No real client data, no PII, no secrets, no connection strings."
 *
 * Wired as a PreToolUse hook on Edit|Write|MultiEdit in .claude/settings.json. It runs BEFORE the
 * write lands, inspects the text Claude Code is about to write, and if it finds a secret or a
 * connection string it BLOCKS the write (exit code 2) and tells Claude why — so the secret never
 * reaches disk. This is the "guarantee", not the "strong default": it runs every time, on every
 * write, no matter how the prompt was phrased.
 *
 * Written in Node (no bash) so it runs identically on Windows, macOS and Linux — every trainee has
 * Node because Claude Code requires it.
 *
 * Exit codes:  0 = allow (silent)   2 = block (message on stderr goes back to Claude)
 */

// --- read the hook payload from stdin (JSON) -------------------------------
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let payload = {};
  try { payload = JSON.parse(raw || '{}'); } catch { process.exit(0); } // never break the session on bad input

  const ti = payload.tool_input || {};
  // Gather every piece of text this tool call would write.
  const chunks = [];
  if (typeof ti.content === 'string') chunks.push(ti.content);        // Write
  if (typeof ti.new_string === 'string') chunks.push(ti.new_string);  // Edit
  if (Array.isArray(ti.edits)) for (const e of ti.edits) {            // MultiEdit
    if (e && typeof e.new_string === 'string') chunks.push(e.new_string);
  }
  const text = chunks.join('\n');
  if (!text.trim()) process.exit(0);

  // --- the forbidden patterns (secrets & connection strings) ---------------
  const RULES = [
    [/-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,      'a private key'],
    [/\bAKIA[0-9A-Z]{16}\b/,                                       'an AWS access key id'],
    [/\b(sk|rk)_(live|test)_[A-Za-z0-9]{16,}\b/,                  'a live secret API key'],
    [/\bghp_[A-Za-z0-9]{20,}\b/,                                   'a GitHub token'],
    [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,                          'a Slack token'],
    // real connection strings with embedded credentials
    [/\b(mongodb(\+srv)?|postgres(ql)?|mysql|redis|amqps?):\/\/[^\/\s:'"`]+:[^@\s'"`]+@/i, 'a database connection string with credentials'],
    [/(Server|Data Source|Host)\s*=[^;"'`\n]+;[^\n]*(Password|Pwd)\s*=\s*[^;"'`\s]+/i,      'a SQL Server connection string with a password'],
    // an obvious hard-coded secret literal (>=8 chars, not a placeholder)
    [/\b(password|passwd|pwd|secret|api[_-]?key|apikey|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*["'`]([^"'`]{8,})["'`]/i, 'a hard-coded secret'],
  ];

  // Placeholder values are allowed — they are not real secrets.
  const PLACEHOLDER = /(change[_-]?me|example|placeholder|your[_-]|xxx+|\.\.\.|<[^>]+>|dummy|fake|sample|redacted|env\.|process\.env|getenv|configuration\[)/i;

  for (const [re, what] of RULES) {
    const m = text.match(re);
    if (!m) continue;
    // For the generic "secret literal" rule, let obvious placeholders through.
    if (what === 'a hard-coded secret' && PLACEHOLDER.test(m[0])) continue;
    const snippet = m[0].slice(0, 60).replace(/\s+/g, ' ');
    process.stderr.write(
      `BLOCKED by FleetLink guardrail: this write appears to contain ${what} ` +
      `(matched: "${snippet}...").\n` +
      `The CLAUDE.md sandbox rule forbids real secrets, PII and connection strings in the repo. ` +
      `Use an environment variable or a clearly-fake placeholder instead, then try again.\n`
    );
    process.exit(2); // block the write; Claude sees this message and corrects
  }

  process.exit(0); // clean — allow the write
});
