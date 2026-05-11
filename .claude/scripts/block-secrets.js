#!/usr/bin/env node
// PreToolUse hook for Write|Edit. Blocks writes whose content contains common
// secret patterns. Never crashes the user's session — on any error, allow.

const SECRET_PATTERNS = [
  { re: /AKIA[0-9A-Z]{16}/, label: "AWS access key ID (AKIA...)" },
  { re: /aws_secret_access_key\s*[:=]\s*['"]?[A-Za-z0-9/+=]{30,}/i, label: "AWS secret access key" },
  { re: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/, label: "SendGrid API key" },
  { re: /sk-(?:proj-|ant-)?[A-Za-z0-9_-]{30,}/, label: "OpenAI/Anthropic-style API key (sk-...)" },
  { re: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----/, label: "Private key block" },
  { re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, label: "JWT-style token" },
  { re: /(?:postgres|postgresql|mysql|mongodb|redis):\/\/[^\s:'"]+:[^\s@'"]+@/, label: "Database URL with embedded credentials" },
  { re: /(?:RAILS_MASTER_KEY|SECRET_KEY_BASE|JWT_SECRET|DEVISE_SECRET_KEY)\s*[:=]\s*['"]?[a-f0-9]{32,}/i, label: "Rails-style secret key (32+ hex chars)" },
];

const PLACEHOLDER_HINTS = [
  /your[-_]?(?:key|secret|token|password)[-_]?here/i,
  /\bxxx+\b/i,
  /\bplaceholder\b/i,
  /\bexample\b/i,
  /\bREPLACE_ME\b/i,
  /\bdummy\b/i,
];

const ALLOWED_PATH_HINTS = [
  /\.env\.example$/i,
  /\.env\.sample$/i,
  /\.example$/i,
  /\/fixtures\//i,
  /\/spec\/.*_spec\.[a-z]+$/i,
  /\/test\/.*_test\.[a-z]+$/i,
  /SECRETS_GUIDE/i,
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
    const filePath = input?.tool_input?.file_path || "";
    const content =
      input?.tool_input?.content ??
      input?.tool_input?.new_string ??
      "";

    if (!content || typeof content !== "string") return allow();
    if (ALLOWED_PATH_HINTS.some((re) => re.test(filePath))) return allow();

    for (const { re, label } of SECRET_PATTERNS) {
      const match = content.match(re);
      if (!match) continue;
      const snippet = match[0];
      const aroundIdx = content.indexOf(snippet);
      const ctx = content.slice(Math.max(0, aroundIdx - 60), aroundIdx + snippet.length + 60);
      const looksLikePlaceholder = PLACEHOLDER_HINTS.some((p) => p.test(ctx));
      if (looksLikePlaceholder) continue;

      return deny(
        `Blocked: detected ${label} in write to ${filePath || "<unknown path>"}. ` +
        `If this is intentional (test fixture, .env.example, doc), rename the file to match an allowed pattern ` +
        `(*.example, /fixtures/, /spec/) or use a clear placeholder like "your-key-here". ` +
        `Snippet matched: ${snippet.slice(0, 30)}...`
      );
    }

    allow();
  } catch (_) {
    allow();
  }
})();
