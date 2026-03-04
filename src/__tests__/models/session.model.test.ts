import { SessionModel } from "../../models/session.model";

describe("SessionModel - Success Paths", () => {
  test("defaults isActive to true", () => {
    const session = new SessionModel({ day: "Monday", sessionName: "Morning", timeRange: "7-8" });
    expect(session.isActive).toBe(true);
  });
});

describe("SessionModel - Failure Paths", () => {
  test("rejects invalid day enum", () => {
    const session = new SessionModel({ day: "Funday", sessionName: "Morning", timeRange: "7-8" });
    expect(session.validateSync()).toBeDefined();
  });
});
