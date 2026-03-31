export interface InstanceGeneralSettings {
  censorUsernameInLogs: boolean;
}

export interface InstanceExperimentalSettings {
  enableIsolatedWorkspaces: boolean;
  autoRestartDevServerWhenIdle: boolean;
}

export interface WecomBotChannel {
  type: "wecom_bot";
  webhookUrl: string;
}

export type NotificationChannel = WecomBotChannel;

export interface InstanceNotificationSettings {
  channels: NotificationChannel[];
  notifyOnAgentAuthRequired: boolean;
}

export interface InstanceSettings {
  id: string;
  general: InstanceGeneralSettings;
  experimental: InstanceExperimentalSettings;
  notifications: InstanceNotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}
