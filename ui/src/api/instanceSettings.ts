import type {
  InstanceExperimentalSettings,
  InstanceGeneralSettings,
  InstanceNotificationSettings,
  PatchInstanceGeneralSettings,
  PatchInstanceExperimentalSettings,
  PatchInstanceNotificationSettings,
} from "@paperclipai/shared";
import { api } from "./client";

export const instanceSettingsApi = {
  getGeneral: () =>
    api.get<InstanceGeneralSettings>("/instance/settings/general"),
  updateGeneral: (patch: PatchInstanceGeneralSettings) =>
    api.patch<InstanceGeneralSettings>("/instance/settings/general", patch),
  getExperimental: () =>
    api.get<InstanceExperimentalSettings>("/instance/settings/experimental"),
  updateExperimental: (patch: PatchInstanceExperimentalSettings) =>
    api.patch<InstanceExperimentalSettings>("/instance/settings/experimental", patch),
  getNotifications: () =>
    api.get<InstanceNotificationSettings>("/instance/settings/notifications"),
  updateNotifications: (patch: PatchInstanceNotificationSettings) =>
    api.patch<InstanceNotificationSettings>("/instance/settings/notifications", patch),
};
