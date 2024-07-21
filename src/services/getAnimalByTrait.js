const AWS = require("aws-sdk");
const cache = require("../cache/cache");

// Cache time-to-live in seconds
const CACHE_TTL = 3600;

// Handler function to get animals by a specific trait and class_type or class_number
async function getAnimalByTrait(event, TableName) {
  const docClient = new AWS.DynamoDB.DocumentClient();
  try {
    // Extract trait and class_key from event arguments
    const trait = Object.values(event.argument.filter)[0];
    const class_key = Object.keys(event.argument.filter)[1];
    const cacheKey = `animalByTrait:${class_key}:${trait}`;

    // Check if the data is in the cache
    const cachedData = cache.get(cacheKey);
    console.log("Cached===>",cachedData)

    // If data is found in cache, return it
    if (cachedData) {
      console.log("Cache data");
      return cachedData;
    }
    console.log("Uncached data");
    const params = {
      TableName,
      FilterExpression: `#${trait} > :${trait} AND #${class_key} = :${class_key}`,
      ExpressionAttributeNames: {
        [`#${trait}`]: trait,
        [`#${class_key}`]: class_key,
      },
      ExpressionAttributeValues: {
        [`:${trait}`]: "0",
        [`:${class_key}`]: event.argument.filter[class_key],
      },
    };

    // Query DynamoDB to get data based on trait and class_key
    const data = await docClient.scan(params).promise();
    console.log(JSON.stringify(data.Items));

    // Store the result in the cache
    cache.set(cacheKey, data.Items, CACHE_TTL);

    return data.Items;
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving animals by trait");
  }
}

module.exports = {
  getAnimalByTrait,
};
