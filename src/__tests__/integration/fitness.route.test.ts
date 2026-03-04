import request from "supertest";
import express from "express";
import fitnessRoutes from "../../routes/fitness.route";
import { FitnessContentModel } from "../../models/fitnessContent.model";

const app = express();
app.use(express.json());
app.use("/api/fitness", fitnessRoutes);

jest.mock("../../middelwares/authorized.middelware", () => ({
  authorizedMiddelWare: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer valid-token") {
      req.user = { id: "a1", role: "admin" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
  optionalAuthorizedMiddelWare: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../middelwares/upload.middelware", () => ({
  upload: { single: () => (_req: any, _res: any, next: any) => next() },
  uploads: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../config/multer", () => ({
  uploadSingle: { single: () => (_req: any, _res: any, next: any) => next() },
  uploadPlanFile: { single: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock("../../controllers/fitnessContent.controller", () => ({
  FitnessContentController: {
    getAllContent: (_req: any, res: any) => res.status(200).json({ success: true, message: "All", data: [] }),
    getContentByTag: (_req: any, res: any) => res.status(200).json({ success: true, message: "Tag", data: [] }),
    getContentByAdmin: (_req: any, res: any) => res.status(200).json({ success: true, message: "Admin", data: [] }),
    getContentById: (_req: any, res: any) => res.status(200).json({ success: true, message: "One", data: {} }),
    createContent: (_req: any, res: any) => res.status(201).json({ success: true, message: "Created", data: { id: "f1" } }),
    uploadPhoto: (_req: any, res: any) => res.status(200).json({ success: true, message: "Photo", data: { image: "x" } }),
    uploadVideo: (_req: any, res: any) => res.status(200).json({ success: true, message: "Video", data: { video: "x" } }),
    updateContent: (_req: any, res: any) => res.status(200).json({ success: true, message: "Updated", data: { id: "f1" } }),
    deleteContent: (_req: any, res: any) => res.status(200).json({ success: true, message: "Deleted", data: { id: "f1" } }),
  },
}));

describe("Fitness Routes - Integration", () => {
  beforeAll(async () => {
    jest.spyOn(FitnessContentModel, "deleteMany").mockResolvedValue({ acknowledged: true, deletedCount: 0 } as any);
    await FitnessContentModel.deleteMany({});
  });

  afterAll(async () => {
    await FitnessContentModel.deleteMany({});
  });

  test("get all fitness content success", async () => {
    const res = await request(app).get("/api/fitness");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Array) }));
  });

  test("create fitness content success with bearer", async () => {
    const res = await request(app).post("/api/fitness").set("Authorization", "Bearer valid-token").send({ title: "T" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });

  test("create fitness content failure without token", async () => {
    const res = await request(app).post("/api/fitness").send({ title: "T" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ success: false, message: expect.any(String) }));
  });

  test("delete fitness content success with bearer", async () => {
    const res = await request(app).delete("/api/fitness/f1").set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, message: expect.any(String), data: expect.any(Object) }));
  });
});
