import { uploadSingle, uploadPlanFile } from "../../config/multer";

describe("Multer Config Utility - Success Paths", () => {
  test("exposes uploadSingle middleware", () => {
    expect(typeof uploadSingle.single).toBe("function");
  });
});

describe("Multer Config Utility - Failure-like Paths", () => {
  test("uploadPlanFile supports fields handler", () => {
    expect(typeof uploadPlanFile.fields).toBe("function");
  });
});
