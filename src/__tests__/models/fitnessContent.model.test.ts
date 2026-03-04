import { FitnessContentModel } from "../../models/fitnessContent.model";

describe("FitnessContentModel - Success Paths", () => {
  test("accepts valid required fields", () => {
    const model = new FitnessContentModel({ title: "Valid title", description: "This is a long valid description text", content: "long enough", image: "/a.jpg", adminName: "Trainer" });
    expect(model.validateSync()).toBeUndefined();
  });
});

describe("FitnessContentModel - Failure Paths", () => {
  test("fails when image is missing", () => {
    const model = new FitnessContentModel({ title: "Valid title", description: "This is a long valid description text", content: "long enough", adminName: "Trainer" });
    expect(model.validateSync()).toBeDefined();
  });
});
