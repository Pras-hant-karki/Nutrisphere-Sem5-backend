import bcryptjs from "bcryptjs";
import { UserService } from "../../services/user.service";

jest.mock("../../repositories/user.repository", () => ({
  __esModule: true,
  ...(() => {
    const mockGetUserByEmail = jest.fn();
    const mockCreateUser = jest.fn();
    return {
      UserRepository: jest.fn().mockImplementation(() => ({
        getUserByEmail: mockGetUserByEmail,
        createUser: mockCreateUser,
        updateUserByEmail: jest.fn(),
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
      })),
      __mocks: { mockGetUserByEmail, mockCreateUser },
    };
  })(),
}));

const { __mocks } = jest.requireMock("../../repositories/user.repository") as any;
const { mockGetUserByEmail, mockCreateUser } = __mocks;

describe("UserService Utility - Success Paths", () => {
  test("registerUser hashes password and creates user", async () => {
    mockGetUserByEmail.mockResolvedValueOnce(null);
    mockCreateUser.mockResolvedValueOnce({ _id: "u1" });
    jest.spyOn(bcryptjs, "hash").mockResolvedValueOnce("hashed" as never);
    const service = new UserService();
    await service.registerUser({ fullName: "John Doe", email: "john@mail.com", password: "123456", confirmPassword: "123456" });
    expect(mockCreateUser).toHaveBeenCalled();
  });
});

describe("UserService Utility - Failure Paths", () => {
  test("registerUser throws when email already exists", async () => {
    mockGetUserByEmail.mockResolvedValueOnce({ _id: "u1" });
    const service = new UserService();
    await expect(service.registerUser({ fullName: "John Doe", email: "john@mail.com", password: "123456", confirmPassword: "123456" })).rejects.toBeDefined();
  });
});
