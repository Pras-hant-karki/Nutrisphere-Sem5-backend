import { CreateFitnessContentDTO } from "../../dtos/fitnessContent.dto";

describe("Fitness DTO Utility - Success Paths", () => {
  test("CreateFitnessContentDTO validates payload", async () => {
    await expect(CreateFitnessContentDTO.parseAsync({ title: "Valid title", description: "This is a long valid description text", content: "long enough" })).resolves.toBeDefined();
  });
});

describe("Fitness DTO Utility - Failure Paths", () => {
  test("rejects unknown field with strict schema", async () => {
    await expect(CreateFitnessContentDTO.parseAsync({ title: "Valid title", description: "This is a long valid description text", adminName: "Coach" })).rejects.toBeDefined();
  });
});
