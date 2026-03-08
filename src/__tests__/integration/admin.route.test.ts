import request from "supertest";
import express from "express";
import adminRoutes from "../../routes/admin.route";
import { UserModel } from "../../infrastructure/database/user.model";

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

jest.mock("../../middelwares/authorized.middelware", () => ({
  authorizedMiddelWare: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer valid-token") {
      req.user = { id: "a1", role: req.headers["x-role"] || "user" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
  optionalAuthorizedMiddelWare: (_req: any, _res: any, next: any) => next(),
  adminMiddelWare: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../middelwares/admin.middleware", () => ({
  adminMiddleware: (req: any, res: any, next: any) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
}));

jest.mock("../../config/multer", () => ({
  uploadSingle: { single: () => (_req: any, _res: any, next: any) => next() },
  uploadPlanFile: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../middelwares/upload.middelware", () => ({
  uploads: { single: () => (_req: any, _res: any, next: any) => next() },
  upload: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../controllers/admin.controller", () => ({
  AdminController: {
    createUser: (_req: any, res: any) => res.status(201).json({ success: true, message: "Created", data: { id: "u1" } }),
    getAllUsers: (_req: any, res: any) => res.status(200).json({ success: true, message: "Users", data: [] }),
    getUserById: (_req: any, res: any) => res.status(200).json({ success: true, message: "User", data: { id: "u1" } }),
    updateUser: (_req: any, res: any) => res.status(200).json({ success: true, message: "Updated", data: { id: "u1" } }),
    deleteUser: (_req: any, res: any) => res.status(200).json({ success: true, message: "Deleted", data: { id: "u1" } }),
    saveBio: (_req: any, res: any) => res.status(200).json({ success: true, message: "Bio saved", data: [] }),
    getBio: (_req: any, res: any) => res.status(200).json({ success: true, message: "Bio", data: [] }),
    uploadBioImage: (_req: any, res: any) => res.status(200).json({ success: true, message: "Bio image", data: { image: "x" } }),
    getTrainerInfo: (_req: any, res: any) => res.status(200).json({ success: true, message: "Trainer", data: {} }),
  },
}));

describe("Admin Routes - Integration", () => {
  beforeAll(async () => {
    jest.spyOn(UserModel, "deleteMany").mockResolvedValue({ acknowledged: true, deletedCount: 0 } as any);
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  test("get all users success with bearer", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", "Bearer valid-token").set("x-role", "admin");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Array) }));
  });

  test("get all users failure without token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("get user by id success", async () => {
    const res = await request(app).get("/api/admin/users/u1").set("Authorization", "Bearer valid-token").set("x-role", "admin");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("create user success", async () => {
    const res = await request(app).post("/api/admin/users").set("Authorization", "Bearer valid-token").set("x-role", "admin").send({ email: "a@a.com" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("update user success", async () => {
    const res = await request(app).put("/api/admin/users/u1").set("Authorization", "Bearer valid-token").set("x-role", "admin").send({ fullName: "Name" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("delete user success", async () => {
    const res = await request(app).delete("/api/admin/users/u1").set("Authorization", "Bearer valid-token").set("x-role", "admin");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("save bio success", async () => {
    const res = await request(app).put("/api/admin/bio").set("Authorization", "Bearer valid-token").set("x-role", "admin").send({ entries: [] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Array) }));
  });

  test("trainer info success with bearer", async () => {
    const res = await request(app).get("/api/admin/trainer-info").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });
});
