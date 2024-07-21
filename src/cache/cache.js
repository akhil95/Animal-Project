class Cache {
    constructor() {
        this.cache = {};
    }

    // Set a value in the cache with a specified TTL
    set(key, value, ttl) {
        const expireAt = Date.now() + ttl * 1000;
        this.cache[key] = { value, expireAt };
    }

    // Get a value from the cache
    get(key) {
        const item = this.cache[key];
        if (!item) {
            return null;
        }
        if (Date.now() > item.expireAt) {
            delete this.cache[key];
            return null;
        }
        return item.value;
    }
}

module.exports = new Cache();
