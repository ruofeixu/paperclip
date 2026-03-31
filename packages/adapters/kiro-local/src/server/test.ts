import path from "node:path";
import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";
import {
  asNumber,
  asString,
  asStringArray,
  ensureAbsoluteDirectory,
  ensureCommandResolvable,
  ensurePathInEnv,
  parseObject,
  runChildProcess,
} from "@paperclipai/adapter-utils/server-utils";
import { DEFAULT_KIRO_LOCAL_MODEL } from "../index.js";
import { stripAnsi, detectKiroAuthRequired } from "./parse.js";

function summarizeStatus(checks: AdapterEnvironmentCheck[]): AdapterEnvironmentTestResult["status"] {
  if (checks.some((check) => check.level === "error")) return "fail";
  if (checks.some((check) => check.level === "warn")) return "warn";
  return "pass";
}

function commandLooksLikeKiro(command: string): boolean {
  const base = path.basename(command).toLowerCase();
  return base === "kiro-cli" || base === "kiro-cli.cmd" || base === "kiro-cli.exe";
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const config = parseObject(ctx.config);
  const command = asString(config.command, "kiro-cli");
  const cwd = asString(config.cwd, process.cwd());

  try {
    await ensureAbsoluteDirectory(cwd, { createIfMissing: true });
    checks.push({ code: "kiro_cwd_valid", level: "info", message: `Working directory is valid: ${cwd}` });
  } catch (err) {
    checks.push({
      code: "kiro_cwd_invalid",
      level: "error",
      message: err instanceof Error ? err.message : "Invalid working directory",
      detail: cwd,
    });
  }

  const envConfig = parseObject(config.env);
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(envConfig)) {
    if (typeof value === "string") env[key] = value;
  }
  const runtimeEnv = ensurePathInEnv({ ...process.env, ...env });

  try {
    await ensureCommandResolvable(command, cwd, runtimeEnv);
    checks.push({ code: "kiro_command_resolvable", level: "info", message: `Command is executable: ${command}` });
  } catch (err) {
    checks.push({
      code: "kiro_command_unresolvable",
      level: "error",
      message: err instanceof Error ? err.message : "Command is not executable",
      detail: command,
    });
  }

  const canRunProbe = checks.every(
    (c) => c.code !== "kiro_cwd_invalid" && c.code !== "kiro_command_unresolvable",
  );

  if (canRunProbe) {
    if (!commandLooksLikeKiro(command)) {
      checks.push({
        code: "kiro_hello_probe_skipped_custom_command",
        level: "info",
        message: "Skipped hello probe because command is not `kiro-cli`.",
        detail: command,
      });
    } else {
      const model = asString(config.model, DEFAULT_KIRO_LOCAL_MODEL).trim();
      const agentName = asString(config.agent, "").trim();
      const helloProbeTimeoutSec = Math.max(1, asNumber(config.helloProbeTimeoutSec, 30));
      const extraArgs = (() => {
        const fromExtraArgs = asStringArray(config.extraArgs);
        if (fromExtraArgs.length > 0) return fromExtraArgs;
        return asStringArray(config.args);
      })();

      const args = ["chat", "--no-interactive", "--trust-all-tools"];
      if (model && model !== DEFAULT_KIRO_LOCAL_MODEL) args.push("--model", model);
      if (agentName) args.push("--agent", agentName);
      if (extraArgs.length > 0) args.push(...extraArgs);

      const probe = await runChildProcess(
        `kiro-envtest-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        command,
        args,
        {
          cwd,
          env,
          timeoutSec: helloProbeTimeoutSec,
          graceSec: 5,
          stdin: "Respond with exactly the word: hello",
          onLog: async () => {},
        },
      );

      const cleanOutput = stripAnsi(probe.stdout);
      const requiresAuth = detectKiroAuthRequired(probe.stdout, probe.stderr);
      const hasHello = /\bhello\b/i.test(cleanOutput);

      if (probe.timedOut) {
        checks.push({
          code: "kiro_hello_probe_timed_out",
          level: "warn",
          message: "Kiro CLI hello probe timed out.",
          hint: "Retry the probe. If this persists, verify kiro-cli can run non-interactively from this directory.",
        });
      } else if ((probe.exitCode ?? 1) === 0 && hasHello) {
        checks.push({
          code: "kiro_hello_probe_passed",
          level: "info",
          message: "Kiro CLI hello probe succeeded.",
          detail: cleanOutput.replace(/\s+/g, " ").trim().slice(0, 240),
        });
      } else if (requiresAuth) {
        checks.push({
          code: "kiro_hello_probe_auth_required",
          level: "warn",
          message: "Kiro CLI is installed, but authentication is not ready.",
          hint: "Run `kiro-cli login` to authenticate, then retry the probe.",
        });
      } else if ((probe.exitCode ?? 1) === 0) {
        checks.push({
          code: "kiro_hello_probe_unexpected_output",
          level: "warn",
          message: "Kiro CLI probe ran but did not return `hello` as expected.",
          detail: cleanOutput.replace(/\s+/g, " ").trim().slice(0, 240),
          hint: "Try `kiro-cli chat --no-interactive --trust-all-tools` manually to inspect output.",
        });
      } else {
        const detail = cleanOutput.replace(/\s+/g, " ").trim().slice(0, 240) || probe.stderr.trim().slice(0, 240);
        checks.push({
          code: "kiro_hello_probe_failed",
          level: "error",
          message: "Kiro CLI hello probe failed.",
          ...(detail ? { detail } : {}),
          hint: "Run `kiro-cli chat --no-interactive --trust-all-tools` manually in this working directory to debug.",
        });
      }
    }
  }

  return {
    adapterType: ctx.adapterType,
    status: summarizeStatus(checks),
    checks,
    testedAt: new Date().toISOString(),
  };
}
