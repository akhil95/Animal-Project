'use strict';

const AWS = require('aws-sdk');
const csv = require('csv-parser');
const { Readable } = require('stream');
const config = require('../../config/config.json'); // Load configuration settings



// Function to convert Buffer to Readable stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; 
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Main function which is triggered by Lambda
const s3todynamo = async (event, context, callback) => {
  const S3 = new AWS.S3();
  const dynamodbDocClient = new AWS.DynamoDB.DocumentClient();
  const dynamotablename = config.dynamoDBTable;

  for (const record of event.Records) {
    const getParams = {
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key
    };

    try {
      const data = await S3.getObject(getParams).promise();
      const results = [];

      // Convert the buffer to a stream
      const stream = bufferToStream(data.Body);

      // Stream the S3 object data through the csv-parser
      await new Promise((resolve, reject) => {
        stream.pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      for (const item of results) {
        // Convert class_type to class_number and use value of class_type from class.csv(static)
        switch (item.class_type) {
          case "1":
            item.class_type = 'Mammal';
            item.class_number = "1";
            break;
          case "2":
            item.class_type = 'Bird';
            item.class_number = "2";
            break;
          case "3":
            item.class_type = 'Reptile';
            item.class_number = "3";
            break;
          case "4":
            item.class_type = 'Fish';
            item.class_number = "4";
            break;
          case "5":
            item.class_type = 'Amphibian';
            item.class_number = "5";
            break;
          case "6":
            item.class_type = 'Bug';
            item.class_number = "6";
            break;
          case "7":
            item.class_type = 'Invertebrate';
            item.class_number = "7";
            break;
          default:
            console.log("Unhandled class_type:", JSON.stringify(item));
        }

        const params = {
          TableName: dynamotablename,
          Item: item
        };

        try {
          //Items are posted to DynamoDB
          await dynamodbDocClient.put(params).promise();
          console.log("Item inserted:", JSON.stringify(item));
        } catch (err) {
          console.error("Error inserting item into DynamoDB:", err);
        }
      }

      callback(null, "Success");
    } catch (err) {
      console.error("Unable to read from S3. Error JSON:", JSON.stringify(err, null, 2));
      callback(err);
    }
  }
};

module.exports.s3todynamo = s3todynamo;
