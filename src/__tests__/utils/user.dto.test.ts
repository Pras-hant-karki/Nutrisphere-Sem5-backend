import { RegisterUserDTO, LoginUserDTO } from "../../dtos/user.dto";

describe("User DTO Utility - Success Paths", () => {
  test("RegisterUserDTO validates correct payload", async () => {
    await expect(RegisterUserDTO.parseAsync({ fullName: "John Doe", email: "john@mail.com", password: "123456", confirmPassword: "123456", role: "user" })).resolves.toBeDefined();
  });
});

describe("User DTO Utility - Failure Paths", () => {
  test("LoginUserDTO rejects missing password", async () => {
    await expect(LoginUserDTO.parseAsync({ email: "john@mail.com" })).rejects.toBeDefined();
  });
});
