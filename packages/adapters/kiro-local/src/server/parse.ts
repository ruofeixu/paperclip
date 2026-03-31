// Strip ANSI escape codes from a string
const ANSI_RE = /\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07|\x1b[()][AB012]/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, "");
}

/**
 * Parse kiro-cli plain-text output.
 * kiro-cli outputs ANSI-colored text. We strip ANSI and extract the response
 * text (the line after the "> " prompt indicator).
 */
export function parseKiroOutput(rawStdout: string): {
  summary: string;
  errorMessage: string | null;
} {
  const clean = stripAnsi(rawStdout);
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Filter out known preamble/footer lines
  const responseLines: string[] = [];
  for (const line of lines) {
    // Skip trust warning lines
    if (line.startsWith("All tools are now trusted")) continue;
    if (line.startsWith("Agents can sometimes do unexpected things")) continue;
    if (line.startsWith("Learn more at")) continue;
    // Skip credits/time footer
    if (/^[▸►]\s*Credits:/.test(line)) continue;
    if (/^Credits:/.test(line)) continue;
    responseLines.push(line);
  }

  const summary = responseLines.join("\n").trim();
  return { summary, errorMessage: null };
}

export function detectKiroAuthRequired(stdout: string, stderr: string): boolean {
  const haystack = `${stdout}\n${stderr}`;
  return /not\s+logged\s+in|please\s+log\s+in|authentication\s+required|unauthorized|login\s+required/i.test(
    haystack,
  );
}
