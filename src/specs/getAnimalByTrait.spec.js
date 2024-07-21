const AWS = require('aws-sdk');
const cache = require('../cache/cache');
const { getAnimalByTrait } = require('../services/getAnimalByTrait');

jest.mock('aws-sdk');
jest.mock('../cache/cache');

describe('getAnimalByTrait', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const TableName = 'AnimalsTable';
    const event = {
        argument: {
            filter: {
                size: 'large',
                class_type: 'Mammal'
            }
        }
    };

    it('should return cached data if available', async () => {
        const cachedData = [{ id: 1, name: 'Elephant' }];
        cache.get.mockReturnValue(cachedData);

        const result = await getAnimalByTrait(event, TableName);
        expect(result).toEqual(cachedData);
        expect(cache.get).toHaveBeenCalledWith('animalByTrait:class_type:large');
        expect(AWS.DynamoDB.DocumentClient.prototype.scan).not.toHaveBeenCalled();
    });

    it('should query DynamoDB and cache the result if not cached', async () => {
        const items = [{ id: 1, name: 'Elephant' }];
        const mockDocClient = {
            scan: jest.fn().mockReturnValue({
                promise: () => Promise.resolve({ Items: items })
            })
        };
        
        AWS.DynamoDB.DocumentClient.mockImplementation(() => mockDocClient);

        cache.get.mockReturnValue(null); // Simulate cache miss

        const result = await getAnimalByTrait(event, TableName);
        expect(result).toEqual(items);
        expect(cache.set).toHaveBeenCalledWith('animalByTrait:class_type:large', items, 3600);
    });

    it('should throw an error if DynamoDB query fails', async () => {
        const mockDocClient = {
            scan: jest.fn().mockReturnValue({
                promise: () => Promise.reject(new Error('DynamoDB error'))
            })
        };
        AWS.DynamoDB.DocumentClient.mockImplementation(() => mockDocClient);

        cache.get.mockReturnValue(null); // Simulate cache miss

        await expect(getAnimalByTrait(event, TableName)).rejects.toThrow('Error retrieving animals by trait');
        expect(cache.get).toHaveBeenCalledWith('animalByTrait:class_type:large');
        expect(cache.set).not.toHaveBeenCalled();
    });
});
