import { describe, expect, it } from "vitest";
import { notificationApiPaths } from "./index";

describe("notification API paths", () => {
  it("builds notification routes for Backend v0.22.2", () => {
    expect(notificationApiPaths.notifications).toBe("/api/v1/notifications");
    expect(notificationApiPaths.notificationRead(7)).toBe("/api/v1/notifications/7/read");
    expect(notificationApiPaths.notificationsReadAll).toBe("/api/v1/notifications/read-all");
    expect(notificationApiPaths.notificationPreferences).toBe("/api/v1/notification-preferences");
  });
});
