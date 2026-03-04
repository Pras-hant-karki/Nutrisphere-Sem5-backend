import { upload, uploads } from "../../middelwares/upload.middelware";

describe("upload middleware - Success Paths", () => {
  test("upload middleware exposes single handler", () => {
    expect(typeof upload.single).toBe("function");
  });
});

describe("upload middleware - Failure Paths", () => {
  test("uploads helper exposes array and fields handlers", () => {
    expect(typeof uploads.array).toBe("function");
    expect(typeof uploads.fields).toBe("function");
  });
});
