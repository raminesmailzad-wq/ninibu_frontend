import { describe, expect, it } from "vitest";
import { apiPaths } from "./index";

describe("api paths", () => {
  it("builds child growth route", () => {
    expect(apiPaths.childGrowthMeasurements(42)).toBe("/api/v1/children/42/growth-measurements");
  });

  it("builds child health timeline route", () => {
    expect(apiPaths.childHealthTimeline("7")).toBe("/api/v1/children/7/health-timeline");
  });

  it("builds community post routes", () => {
    expect(apiPaths.communityGroupPosts(8)).toBe("/api/v1/community/groups/8/posts");
    expect(apiPaths.communityPostReaction(12, "helpful")).toBe("/api/v1/community/posts/12/reactions/helpful");
  });
});

describe("consultation and booking api paths", () => {
  it("builds consultation routes", () => {
    expect(apiPaths.consultationQuestion(12)).toBe("/api/v1/consultations/questions/12");
    expect(apiPaths.consultationAnswerAccept(12, 7)).toBe("/api/v1/consultations/questions/12/answers/7/accept");
  });

  it("builds booking and payment routes", () => {
    expect(apiPaths.serviceAvailability(3)).toBe("/api/v1/commerce/services/3/available-slots");
    expect(apiPaths.bookingCancel(9)).toBe("/api/v1/bookings/9/cancel");
    expect(apiPaths.orderPayments(22)).toBe("/api/v1/commerce/orders/22/payments");
  });
});

describe("knowledge and discovery api paths", () => {
  it("builds knowledge routes", () => {
    expect(apiPaths.contentDetail("sleep-guide")).toBe("/api/v1/content/sleep-guide");
    expect(apiPaths.contentBookmark(18)).toBe("/api/v1/content/18/bookmark");
  });

  it("builds search and personalization routes", () => {
    expect(apiPaths.searchHistoryItem(4)).toBe("/api/v1/search/history/4");
    expect(apiPaths.personalizationFeedback(9)).toBe("/api/v1/recommendations/9/feedback");
  });
});
