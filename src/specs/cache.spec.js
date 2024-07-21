const Cache = require('../cache/cache.js');

describe('Cache', () => {
    beforeEach(() => {
        Cache.cache = {}; // Clear the cache before each test
    });

    it('should set and get a value within TTL', () => {
        Cache.set('key1', 'value1', 1); // Set with TTL of 1 second
        const result = Cache.get('key1');
        expect(result).toBe('value1');
    });

    it('should return null for non-existent key', () => {
        const result = Cache.get('nonExistentKey');
        expect(result).toBeNull();
    });

    it('should return null for expired key', (done) => {
        Cache.set('key2', 'value2', 0.001); // Set with TTL of 1 ms
        setTimeout(() => {
            const result = Cache.get('key2');
            expect(result).toBeNull();
            done();
        }, 10);
    });

    it('should delete expired key from cache', (done) => {
        Cache.set('key3', 'value3', 0.001); // Set with TTL of 1 ms
        setTimeout(() => {
            const result = Cache.get('key3');
            expect(result).toBeNull();
            expect(Cache.cache).not.toHaveProperty('key3');
            done();
        }, 10);
    });

    it('should return value for key before it expires', (done) => {
        Cache.set('key4', 'value4', 0.1); // Set with TTL of 100 ms
        setTimeout(() => {
            const result = Cache.get('key4');
            expect(result).toBe('value4');
            done();
        }, 50);
    });
});
