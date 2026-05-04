class CacheManager {
    static load(key, ttl = CONFIG.cacheTTL) {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < ttl) {
                    return data;
                }
            }
        } catch (e) {}
        return null;
    }

    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {}
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    }
}
