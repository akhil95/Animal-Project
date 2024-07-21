const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient(); 
const config = require('../config/config.json'); // Load configuration settings
const { getAnimalClassSummary } = require('./services/getAnimalClassSummary'); // Import handler functions
const { getAnimalByTrait } = require('./services/getAnimalByTrait'); // Import handler functions
const { s3todynamo } = require('./services/handler');// const { getAnimalClassSummary } = require('./services/getAnimalClassSummary');/

exports.AppsyncToLambda = async function(event) {
    switch(event.field) { // Determine which function to call based on the event's field
        case "getAnimalClassSummary":
            return await getAnimalClassSummary(config.dynamoDBTable); // Call function to get summary
        case "getAnimalByTrait":
            return await getAnimalByTrait(event, config.dynamoDBTable); // Call function to get animals by trait
        default:
            throw new Error("Unknown field in event"); // Handle unknown fields
    }
}


exports.s3todynamo = async function(event, context, callback) {
    return await s3todynamo(event, context, callback); // Call function to get summary
}
