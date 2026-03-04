import { UserModel } from "../../infrastructure/database/user.model";

describe("UserModel - Success Paths", () => {
  test("sets default role and isActive", () => {
    const user = new UserModel({ fullName: "John Doe", email: "john@mail.com", password: "123456" });
    expect(user.role).toBe("user");
    expect(user.isActive).toBe(true);
  });
});

describe("UserModel - Failure Paths", () => {
  test("fails validation for invalid role", () => {
    const user = new UserModel({ fullName: "John Doe", email: "john@mail.com", password: "123456", role: "bad" });
    expect(user.validateSync()).toBeDefined();
  });
});
