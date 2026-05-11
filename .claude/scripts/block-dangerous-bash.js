#!/usr/bin/env node
// PreToolUse hook for Bash. Blocks a small set of irreversible / dangerous
// commands specific to this Rails+React+git workflow. Never crashes the user's
// session — on any error, allow.

const DANGEROUS_PATTERNS = [
  {
    re: /\bgit\s+push\b[^&|;]*\s--force(?:-with-lease)?(?!=)\b[^&|;]*\b(?:master|main|origin\s+master|origin\s+main)\b/,
    label: "git push --force to master/main",
    why: "Force-pushing to master/main rewrites shared history. If you really need this, run it without the hook (e.g. via terminal directly) and confirm no one else has pulled.",
  },
  {
    re: /\bgit\s+push\b[^&|;]*\b(?:master|main|origin\s+master|origin\s+main)\b[^&|;]*\s--force/,
    label: "git push --force to master/main (flag last)",
    why: "Force-pushing to master/main rewrites shared history.",
  },
  {
    re: /\brm\s+-rf?\s+(?:\/(?!\w*\/)|~\/?$|~\s|\$HOME(?:\b|\/?$)|\.git(?:\b|\/?$))/,
    label: "rm -rf on a protected root path (/, ~, $HOME, .git)",
    why: "These deletions are unrecoverable. Use a more specific path or move to trash instead.",
  },
  {
    re: /\b(?:bundle\s+exec\s+)?rails\s+db:(?:drop|reset|purge)\b(?!\s+RAILS_ENV=test)/,
    label: "rails db:drop / db:reset / db:purge without RAILS_ENV=test",
    why: "Drops the dev/prod database. Append RAILS_ENV=test if you really mean the test DB, or run it manually.",
  },
  {
    re: /\b(?:DROP|TRUNCATE)\s+(?:TABLE|DATABASE|SCHEMA)\b/i,
    label: "raw SQL DROP/TRUNCATE",
    why: "Irreversible schema destruction. Run manually if intentional.",
  },
  {
    re: /\bgit\s+(?:checkout|restore|switch)\b[^&|;]*--\s+\./,
    label: "git checkout/restore -- . (discard all uncommitted changes)",
    why: "Discards ALL uncommitted changes in the working tree. If intentional, run manually.",
  },
];

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    setTimeout(() => resolve(data), 2000);
  });
}

function allow() {
  process.stdout.write("{}");
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

(async () => {
  try {
    const raw = await readStdin();
    if (!raw.trim()) return allow();
    const input = JSON.parse(raw);
    const cmd = input?.tool_input?.command;
    if (!cmd || typeof cmd !== "string") return allow();

    for (const { re, label, why } of DANGEROUS_PATTERNS) {
      if (re.test(cmd)) {
        return deny(`Blocked dangerous command: ${label}. ${why}`);
      }
    }
    allow();
  } catch (_) {
    allow();
  }
})();
