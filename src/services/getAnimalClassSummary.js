const AWS = require("aws-sdk");
const cache = require("../cache/cache");

// Cache time-to-live in seconds
const CACHE_TTL = 3600;

// Handler function to get a summary of animal classes
async function getAnimalClassSummary(TableName) {
  const docClient = new AWS.DynamoDB.DocumentClient();
  try {
    // Cache key for animal class summary
    const cacheKey = "animalClassSummary";
    const cachedData = cache.get(cacheKey);
    // If data is found in cache, return it
    if (cachedData) {
      console.log("Cached data");
      return cachedData;
    }

    console.log("Uncached data");
    const params = {
      TableName,
      ProjectionExpression: "class_type",
    };
    // Query DynamoDB to get class_type data
    const data = await docClient.scan(params).promise();
    const summary = data.Items.reduce((acc, item) => {
      const class_type = item.class_type;
      if (!acc[class_type]) {
        acc[class_type] = 0;
      }
      acc[class_type]++;
      return acc;
    }, {});

    // Transform the summary into an array of objects
    const result = Object.keys(summary).map((class_type, index) => ({
      class_number: index + 1,
      class_type,
      number_of_animals: summary[class_type],
    }));

    // Store the result in the cache
    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving animals by summary");
  }
}

module.exports = {
    getAnimalClassSummary,
};
