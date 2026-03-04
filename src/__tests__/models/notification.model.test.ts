import { NotificationModel } from "../../models/notification.model";
import mongoose from "mongoose";

describe("NotificationModel - Success Paths", () => {
  test("defaults isRead to false", () => {
    const doc = new NotificationModel({ recipientId: new mongoose.Types.ObjectId(), type: "new_post", title: "T", message: "M" });
    expect(doc.isRead).toBe(false);
  });
});

describe("NotificationModel - Failure Paths", () => {
  test("fails for invalid type", () => {
    const doc = new NotificationModel({ recipientId: new mongoose.Types.ObjectId(), type: "bad", title: "T", message: "M" });
    expect(doc.validateSync()).toBeDefined();
  });
});
