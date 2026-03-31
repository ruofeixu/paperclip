export const type = "kiro_local";
export const label = "Kiro CLI (local)";
export const DEFAULT_KIRO_LOCAL_MODEL = "auto";

export const models = [
  { id: "auto", label: "Auto" },
  { id: "claude-opus-4.6", label: "Claude Opus 4.6" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "claude-opus-4.5", label: "Claude Opus 4.5" },
  { id: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { id: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "deepseek-3.2", label: "DeepSeek V3.2" },
];

export const agentConfigurationDoc = `# kiro_local agent configuration

Adapter: kiro_local

Use when:
- You want Paperclip to run Kiro CLI locally as the agent runtime
- You want to use Kiro's built-in tools and capabilities as an agent

Don't use when:
- You need webhook-style external invocation (use openclaw_gateway or http)
- You only need one-shot shell commands (use process)
- Kiro CLI is not installed on the machine

Core fields:
- cwd (string, optional): default absolute working directory for the agent process (created if missing)
- instructionsFilePath (string, optional): absolute path to a markdown instructions file prepended to the run prompt
- promptTemplate (string, optional): run prompt template
- model (string, optional): Kiro model id (e.g. auto, claude-sonnet-4.6)
- agent (string, optional): Kiro agent name to use (--agent flag)
- command (string, optional): defaults to "kiro-cli"
- extraArgs (string[], optional): additional CLI args
- env (object, optional): KEY=VALUE environment variables

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds

Notes:
- Runs are executed with: kiro-cli chat --no-interactive --trust-all-tools ...
- Prompts are piped to Kiro CLI via stdin.
- Kiro CLI outputs plain text with ANSI escape codes; Paperclip strips ANSI for clean logs.
`;
