import { z } from "zod";

export const instanceGeneralSettingsSchema = z.object({
  censorUsernameInLogs: z.boolean().default(false),
}).strict();

export const patchInstanceGeneralSettingsSchema = instanceGeneralSettingsSchema.partial();

export const instanceExperimentalSettingsSchema = z.object({
  enableIsolatedWorkspaces: z.boolean().default(false),
  autoRestartDevServerWhenIdle: z.boolean().default(false),
}).strict();

export const patchInstanceExperimentalSettingsSchema = instanceExperimentalSettingsSchema.partial();

export type InstanceGeneralSettings = z.infer<typeof instanceGeneralSettingsSchema>;
export type PatchInstanceGeneralSettings = z.infer<typeof patchInstanceGeneralSettingsSchema>;
export type InstanceExperimentalSettings = z.infer<typeof instanceExperimentalSettingsSchema>;
export type PatchInstanceExperimentalSettings = z.infer<typeof patchInstanceExperimentalSettingsSchema>;

// ---------------------------------------------------------------------------
// Notification settings
// ---------------------------------------------------------------------------

export const wecomBotChannelSchema = z.object({
  type: z.literal("wecom_bot"),
  webhookUrl: z.string().url(),
}).strict();

export const notificationChannelSchema = wecomBotChannelSchema;

export const instanceNotificationSettingsSchema = z.object({
  channels: z.array(notificationChannelSchema).default([]),
  notifyOnAgentAuthRequired: z.boolean().default(true),
}).strict();

export const patchInstanceNotificationSettingsSchema = instanceNotificationSettingsSchema.partial();

export type WecomBotChannel = z.infer<typeof wecomBotChannelSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type InstanceNotificationSettings = z.infer<typeof instanceNotificationSettingsSchema>;
export type PatchInstanceNotificationSettings = z.infer<typeof patchInstanceNotificationSettingsSchema>;

