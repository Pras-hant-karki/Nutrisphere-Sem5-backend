import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { authorizedMiddelWare, optionalAuthorizedMiddelWare } from "../../middelwares/authorized.middelware";

jest.mock("../../infrastructure/database/mongo-user.repository", () => ({
  MongoUserRepository: jest.fn().mockImplementation(() => ({
    getUserById: jest.fn(async (id: string) => (id === "ok" ? { id: "ok", role: "user", isActive: true } : null)),
  })),
}));

describe("authorized middleware - Success Paths", () => {
  test("optional auth passes without token", async () => {
    const next = jest.fn() as NextFunction;
    await optionalAuthorizedMiddelWare({ headers: {} } as Request, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test("optional auth attaches user when token valid", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ id: "ok" } as any);
    const req = { headers: { authorization: "Bearer token" } } as unknown as Request;
    await optionalAuthorizedMiddelWare(req, {} as Response, jest.fn() as NextFunction);
    expect((req as any).user?.id).toBe("ok");
  });

  test("required auth calls next for valid token", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ id: "ok" } as any);
    const req = { headers: { authorization: "Bearer token" } } as unknown as Request;
    const next = jest.fn() as NextFunction;
    await authorizedMiddelWare(req, { status: jest.fn().mockReturnThis(), json: jest.fn() } as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("authorized middleware - Failure Paths", () => {
  test("required auth returns 401 without bearer token", async () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    await authorizedMiddelWare({ headers: {} } as Request, res, jest.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("required auth returns 401 for invalid payload", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({} as any);
    const req = { headers: { authorization: "Bearer x" } } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    await authorizedMiddelWare(req, res, jest.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("required auth returns 401 for unknown user", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ id: "missing" } as any);
    const req = { headers: { authorization: "Bearer x" } } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    await authorizedMiddelWare(req, res, jest.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
