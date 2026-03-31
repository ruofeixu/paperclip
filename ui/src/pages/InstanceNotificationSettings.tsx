import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2 } from "lucide-react";
import type { NotificationChannel, WecomBotChannel } from "@paperclipai/shared";
import { instanceSettingsApi } from "@/api/instanceSettings";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "../lib/utils";

function WecomBotChannelRow({
  channel,
  onRemove,
}: {
  channel: WecomBotChannel;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="shrink-0 rounded bg-green-600/10 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        企微机器人
      </span>
      <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
        {channel.webhookUrl}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Remove channel"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function InstanceNotificationSettings() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Instance Settings" },
      { label: "Notifications" },
    ]);
  }, [setBreadcrumbs]);

  const query = useQuery({
    queryKey: queryKeys.instance.notificationSettings,
    queryFn: () => instanceSettingsApi.getNotifications(),
  });

  const updateMutation = useMutation({
    mutationFn: instanceSettingsApi.updateNotifications,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.instance.notificationSettings });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Failed to update notification settings.");
    },
  });

  if (query.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading notification settings...</div>;
  }
  if (query.error) {
    return (
      <div className="text-sm text-destructive">
        {query.error instanceof Error ? query.error.message : "Failed to load notification settings."}
      </div>
    );
  }

  const settings = query.data!;
  const channels: NotificationChannel[] = settings.channels ?? [];
  const notifyOnAuthRequired = settings.notifyOnAgentAuthRequired !== false;

  function handleAddWecomBot() {
    const url = newWebhookUrl.trim();
    if (!url) {
      setAddError("Webhook URL is required.");
      return;
    }
    try {
      new URL(url);
    } catch {
      setAddError("Please enter a valid URL.");
      return;
    }
    setAddError(null);
    const newChannel: WecomBotChannel = { type: "wecom_bot", webhookUrl: url };
    updateMutation.mutate({ channels: [...channels, newChannel] });
    setNewWebhookUrl("");
  }

  function handleRemoveChannel(index: number) {
    const next = channels.filter((_, i) => i !== index);
    updateMutation.mutate({ channels: next });
  }

  function handleToggleAuthRequired() {
    updateMutation.mutate({ notifyOnAgentAuthRequired: !notifyOnAuthRequired });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure notification channels for system alerts such as agent authentication expiry.
        </p>
      </div>

      {actionError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {/* Auth-required toggle */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">Notify on agent authentication required</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Send a notification when an agent run fails because its credentials have expired (e.g. kiro-cli or
              cursor agent login expired). The agent will also be automatically paused.
            </p>
          </div>
          <button
            type="button"
            data-slot="toggle"
            aria-label="Toggle auth-required notifications"
            disabled={updateMutation.isPending}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              notifyOnAuthRequired ? "bg-green-600" : "bg-muted",
            )}
            onClick={handleToggleAuthRequired}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                notifyOnAuthRequired ? "translate-x-4.5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </section>

      {/* Channels */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Notification channels</h2>
          <p className="text-sm text-muted-foreground">
            Add one or more channels to receive notifications.
          </p>
        </div>

        {channels.length > 0 && (
          <div className="space-y-2">
            {channels.map((ch, i) =>
              ch.type === "wecom_bot" ? (
                <WecomBotChannelRow
                  key={i}
                  channel={ch}
                  onRemove={() => handleRemoveChannel(i)}
                />
              ) : null,
            )}
          </div>
        )}

        {/* Add wecom bot */}
        <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Add 企微机器人 (WeCom Bot)
          </Label>
          <p className="text-xs text-muted-foreground">
            Create a bot in WeCom group chat settings and paste the webhook URL below.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
              value={newWebhookUrl}
              onChange={(e) => {
                setNewWebhookUrl(e.target.value);
                setAddError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddWecomBot()}
              className="flex-1 font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={updateMutation.isPending || !newWebhookUrl.trim()}
              onClick={handleAddWecomBot}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {addError && (
            <p className="text-xs text-destructive">{addError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
