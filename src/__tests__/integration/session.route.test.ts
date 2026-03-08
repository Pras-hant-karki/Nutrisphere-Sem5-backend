import request from "supertest";
import express from "express";
import sessionRoutes from "../../routes/session.route";
import { SessionModel } from "../../models/session.model";

const app = express();
app.use(express.json());
app.use("/api/sessions", sessionRoutes);

jest.mock("../../middelwares/authorized.middelware", () => ({
  authorizedMiddelWare: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer valid-token") {
      req.user = { id: "u1", role: req.headers["x-role"] || "user" };
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

jest.mock("../../controllers/session.controller", () => ({
  SessionController: {
    getActiveSessions: (_req: any, res: any) => res.status(200).json({ success: true, message: "Sessions", data: [] }),
    getAllSessionsForAdmin: (_req: any, res: any) => res.status(200).json({ success: true, message: "Admin sessions", data: [] }),
    createSession: (_req: any, res: any) => res.status(201).json({ success: true, message: "Created", data: { id: "s1" } }),
    updateSession: (_req: any, res: any) => res.status(200).json({ success: true, message: "Updated", data: { id: "s1" } }),
    toggleSession: (_req: any, res: any) => res.status(200).json({ success: true, message: "Toggled", data: { id: "s1" } }),
    deleteSession: (_req: any, res: any) => res.status(200).json({ success: true, message: "Deleted", data: { id: "s1" } }),
  },
}));

jest.mock("../../middelwares/upload.middelware", () => ({
  uploads: { single: () => (_req: any, _res: any, next: any) => next() },
  upload: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../config/multer", () => ({
  uploadSingle: { single: () => (_req: any, _res: any, next: any) => next() },
  uploadPlanFile: { single: () => (_req: any, _res: any, next: any) => next() },
}));

describe("Session Routes - Integration", () => {
  beforeAll(async () => {
    jest.spyOn(SessionModel, "deleteMany").mockResolvedValue({ acknowledged: true, deletedCount: 0 } as any);
    await SessionModel.deleteMany({});
  });

  afterAll(async () => {
    await SessionModel.deleteMany({});
  });

  test("get active sessions success with bearer", async () => {
    const res = await request(app).get("/api/sessions").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Array) }));
  });

  test("get active sessions failure without token", async () => {
    const res = await request(app).get("/api/sessions");
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("get admin sessions success", async () => {
    const res = await request(app).get("/api/sessions/admin").set("Authorization", "Bearer valid-token").set("x-role", "admin");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Array) }));
  });

  test("create admin session success", async () => {
    const res = await request(app).post("/api/sessions/admin").set("Authorization", "Bearer valid-token").set("x-role", "admin").send({ day: "Monday" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("toggle admin session failure for non-admin", async () => {
    const res = await request(app).patch("/api/sessions/admin/s1/toggle").set("Authorization", "Bearer valid-token").set("x-role", "user");
    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });
});
