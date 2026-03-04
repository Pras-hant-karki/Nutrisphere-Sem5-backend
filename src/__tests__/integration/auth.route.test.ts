import request from "supertest";
import express from "express";
import authRoutes from "../../routes/auth.route";
import { UserModel } from "../../infrastructure/database/user.model";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

jest.mock("../../middelwares/authorized.middelware", () => ({
  authorizedMiddelWare: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer valid-token") {
      req.user = { id: "u1", role: "user" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
  optionalAuthorizedMiddelWare: (_req: any, _res: any, next: any) => next(),
  adminMiddelWare: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../middelwares/upload.middelware", () => ({
  uploads: { single: () => (_req: any, _res: any, next: any) => next() },
  upload: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../config/multer", () => ({
  uploadSingle: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../infrastructure/web/auth.controller", () => ({
  UserController: {
    register: (req: any, res: any) => {
      if (req.body?.fail) return res.status(400).json({ success: false, message: "Register failed" });
      return res.status(201).json({ success: true, message: "Registered", data: { id: "u1" } });
    },
    login: (req: any, res: any) => {
      if (req.body?.fail) return res.status(401).json({ success: false, message: "Login failed" });
      return res.status(200).json({ success: true, message: "Logged in", data: { token: "valid-token" } });
    },
    getMe: (_req: any, res: any) => res.status(200).json({ success: true, message: "Me", data: { id: "u1" } }),
    uploadProfilePicture: (_req: any, res: any) => res.status(200).json({ success: true, message: "Uploaded", data: { image: "x" } }),
    getProfilePicture: (_req: any, res: any) => res.status(200).json({ success: true, message: "Profile", data: { image: "x" } }),
    updateProfile: (_req: any, res: any) => res.status(200).json({ success: true, message: "Updated", data: { id: "u1" } }),
  },
}));

describe("Auth Routes - Integration", () => {
  beforeAll(async () => {
    jest.spyOn(UserModel, "deleteMany").mockResolvedValue({ acknowledged: true, deletedCount: 0 } as any);
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  test("register success", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@a.com" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("register failure", async () => {
    const res = await request(app).post("/api/auth/register").send({ fail: true });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("login success", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "a@a.com", password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("login failure", async () => {
    const res = await request(app).post("/api/auth/login").send({ fail: true });
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("get me success with bearer", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("get me failure without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("upload profile picture success with bearer", async () => {
    const res = await request(app).post("/api/auth/profile-picture").set("Authorization", "Bearer valid-token").send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("upload profile picture failure without token", async () => {
    const res = await request(app).post("/api/auth/profile-picture").send({});
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("get profile picture success with bearer", async () => {
    const res = await request(app).get("/api/auth/profile-picture").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("update profile failure without token", async () => {
    const res = await request(app).put("/api/auth/u1").send({ fullName: "Name" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });
});
