const { getAnimalClassSummary } = require("../services/getAnimalClassSummary");
const AWS = require("aws-sdk");
const cache = require("../cache/cache.js");

jest.mock("aws-sdk");
jest.mock("../cache/cache.js");

const mockDocClient = {
  scan: jest.fn(),
};

AWS.DynamoDB.DocumentClient.mockImplementation(() => mockDocClient);

describe("getAnimalClassSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("should return cached data if available", async () => {
    const cachedData = [
      { class_number: 1, class_type: "Mammal", number_of_animals: 10 },
    ];
    cache.get.mockReturnValue(cachedData);

    const result = await getAnimalClassSummary("AnimalsTable");
    expect(result).toEqual(cachedData);
    expect(mockDocClient.scan).not.toHaveBeenCalled();
  });

  it("should query DynamoDB and cache the result if not cached", async () => {
    const items = [
      { class_type: "Mammal" },
      { class_type: "Mammal" },
      { class_type: "Bird" },
    ];
    mockDocClient.scan.mockReturnValue({
      promise: () => Promise.resolve({ Items: items }),
    });
    cache.get.mockReturnValue(null);

    const result = await getAnimalClassSummary("AnimalsTable");

    expect(result).toEqual([
      { class_number: 1, class_type: "Mammal", number_of_animals: 2 },
      { class_number: 2, class_type: "Bird", number_of_animals: 1 },
    ]);

    expect(cache.set).toHaveBeenCalledWith("animalClassSummary", result, 3600);
  });

  it("should throw an error if DynamoDB query fails", async () => {
    mockDocClient.scan.mockReturnValue({
      promise: () => Promise.reject(new Error("DynamoDB error")),
    });

    await expect(getAnimalClassSummary("AnimalsTable")).rejects.toThrow(
      "Error retrieving animals by summary"
    );
  });
});
