const AWS = require('aws-sdk');
const { AppsyncToLambda, s3todynamo } = require('../index');
const config = require('../../config/config.json');
const { getAnimalClassSummary } = require('../services/getAnimalClassSummary');
const { getAnimalByTrait } = require('../services/getAnimalByTrait');
const { s3todynamo: s3todynamoService } = require('../services/handler');

// Mocks
jest.mock('aws-sdk');
jest.mock('../../config/config.json', () => ({
    dynamoDBTable: 'AnimalsTable'
}));
jest.mock('../services/getAnimalClassSummary');
jest.mock('../services/getAnimalByTrait');
jest.mock('../services/handler');

describe('index.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('AppsyncToLambda', () => {
        it('should call getAnimalClassSummary with the correct table name', async () => {
            const event = { field: 'getAnimalClassSummary' };
            const mockResult = [{ class_number: 1, class_type: 'Mammal', number_of_animals: 10 }];
            getAnimalClassSummary.mockResolvedValue(mockResult);

            const result = await AppsyncToLambda(event);

            expect(getAnimalClassSummary).toHaveBeenCalledWith(config.dynamoDBTable);
            expect(result).toEqual(mockResult);
        });

        it('should call getAnimalByTrait with the correct event and table name', async () => {
            const event = {
                field: 'getAnimalByTrait',
                argument: {
                    filter: {
                        size: 'large',
                        class_type: 'Mammal'
                    }
                }
            };
            const mockResult = [{ id: 1, name: 'Elephant' }];
            getAnimalByTrait.mockResolvedValue(mockResult);

            const result = await AppsyncToLambda(event);

            expect(getAnimalByTrait).toHaveBeenCalledWith(event, config.dynamoDBTable);
            expect(result).toEqual(mockResult);
        });

        it('should throw an error for unknown field', async () => {
            const event = { field: 'unknownField' };

            await expect(AppsyncToLambda(event)).rejects.toThrow('Unknown field in event');
        });
    });

    describe('s3todynamo', () => {
        it('should call s3todynamo with the correct parameters', async () => {
            const event = { some: 'event' };
            const context = { some: 'context' };
            const callback = () => {};
            const mockResult = 'result';
            s3todynamoService.mockResolvedValue(mockResult);

            const result = await s3todynamo(event, context, callback);

            expect(s3todynamoService).toHaveBeenCalledWith(event, context, callback);
            expect(result).toEqual(mockResult);
        });
    });
});
