import { NextFunction, Request } from "express";
import { adminMiddleware } from "../../middelwares/admin.middleware";
import { adminMiddelWare } from "../../middelwares/authorized.middelware";

describe("admin middlewares - Success Paths", () => {
  test("adminMiddleware calls next for admin user", () => {
    const next = jest.fn() as NextFunction;
    adminMiddleware({ user: { role: "admin" } } as Request, {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("admin middlewares - Failure Paths", () => {
  test("adminMiddleware forwards 403 for non-admin", () => {
    const next = jest.fn() as NextFunction;
    adminMiddleware({ user: { role: "user" } } as Request, {} as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test("adminMiddelWare returns 401 when request has no user", async () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    await adminMiddelWare({} as Request, res, jest.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
  });
 
  test("adminMiddelWare calls next for admin user", async () => {
    const next = jest.fn() as NextFunction;
    await adminMiddelWare({ user: { role: "admin" } } as Request, {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});
