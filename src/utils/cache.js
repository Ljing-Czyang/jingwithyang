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
        } catch (e) {
            console.warn('CacheManager.load 读取缓存失败:', e);
        }
        return null;
    }

    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('CacheManager.save 写入缓存失败（可能存储空间已满）:', e);
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('CacheManager.remove 删除缓存失败:', e);
        }
    }
}
