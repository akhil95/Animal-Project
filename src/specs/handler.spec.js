'use strict';

const { s3todynamo } = require('../services/handler');
const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { DynamoDB } = require('aws-sdk');

describe('s3todynamo', () => {
  let mockPut;

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS);

    // Mock S3 getObject to return a CSV file with various class types.
    AWSMock.mock('S3', 'getObject', (params, callback) => {
      callback(null, {
        Body: Buffer.from(
          'class_type,other_field\n1,foo\n2,bar\n3,baz\n4,qux\n5,quux\n6,quuz\n7,corge\n8,unknown'
        ),
      });
    });

    // Mock DynamoDB DocumentClient put method.
    mockPut = jest.fn((params, callback) => {
      callback(null, {});
    });

    AWSMock.mock('DynamoDB.DocumentClient', 'put', mockPut);
  });

  afterAll(() => {
    AWSMock.restore('S3');
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  const event = {
    Records: [
      {
        s3: {
          bucket: {
            name: 'example-bucket',
          },
          object: {
            key: 'example-key.csv',
          },
        },
      },
    ],
  };

  const context = {};
  const callback = jest.fn();

  it('should process class_type 1 and put Mammal into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Mammal',
          class_number: '1',
          other_field: 'foo',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 2 and put Bird into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Bird',
          class_number: '2',
          other_field: 'bar',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 3 and put Reptile into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Reptile',
          class_number: '3',
          other_field: 'baz',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 4 and put Fish into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Fish',
          class_number: '4',
          other_field: 'qux',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 5 and put Amphibian into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Amphibian',
          class_number: '5',
          other_field: 'quux',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 6 and put Bug into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Bug',
          class_number: '6',
          other_field: 'quuz',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should process class_type 7 and put Invertebrate into DynamoDB', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'AnimalsTable',
        Item: expect.objectContaining({
          class_type: 'Invertebrate',
          class_number: '7',
          other_field: 'corge',
        }),
      }),
      expect.any(Function)
    );
  });

  it('should handle unknown class_type with default case', async () => {
    await s3todynamo(event, context, callback);

    expect(mockPut).toHaveBeenCalled();
  });

  it('should log an error when unable to read from S3', async () => {
    AWSMock.remock('S3', 'getObject', (params, callback) => {
      callback(new Error(), null);
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await s3todynamo(event, context, callback);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Unable to read from S3. Error JSON:',
      '{}'
    );

    consoleSpy.mockRestore();
  });

  it('should handle empty event.Records array', async () => {
    const emptyEvent = { Records: [] };

    await s3todynamo(emptyEvent, context, callback);

    expect(callback).toHaveBeenCalledWith(null, 'Success');
  });

  it('should handle DynamoDB put error', async () => {
    AWSMock.remock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(new Error('DynamoDB put error'), null);
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await s3todynamo(event, context, callback);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
