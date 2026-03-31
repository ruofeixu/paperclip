import type { UIAdapterModule } from "../types";
import type { TranscriptEntry } from "../types";
import type { AdapterConfigFieldsProps } from "../types";
import { buildKiroLocalConfig } from "@paperclipai/adapter-kiro-local/ui";
import { DraftInput, Field } from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

function KiroLocalConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  if (hideInstructionsFile) return null;
  return (
    <Field
      label="Agent instructions file"
      hint="Absolute path to a markdown file (e.g. AGENTS.md) prepended to the Kiro CLI prompt at runtime."
    >
      <div className="flex items-center gap-2">
        <DraftInput
          value={
            isCreate
              ? (values!.instructionsFilePath ?? "")
              : eff("adapterConfig", "instructionsFilePath", String(config.instructionsFilePath ?? ""))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ instructionsFilePath: v })
              : mark("adapterConfig", "instructionsFilePath", v || undefined)
          }
          immediate
          className={inputClass}
          placeholder="/absolute/path/to/AGENTS.md"
        />
        <ChoosePathButton />
      </div>
    </Field>
  );
}

function parseKiroStdoutLine(line: string, ts: string): TranscriptEntry[] {
  return [{ kind: "stdout", ts, text: line }];
}

export const kiroLocalUIAdapter: UIAdapterModule = {
  type: "kiro_local",
  label: "Kiro CLI (local)",
  parseStdoutLine: parseKiroStdoutLine,
  ConfigFields: KiroLocalConfigFields,
  buildAdapterConfig: buildKiroLocalConfig,
};
