class DataUtils {
    /**
     * 从缓存中读取列表数据，如果缓存不存在则返回传入的默认列表。
     * @param {string} cacheKey - CacheManager 使用的缓存键名。
     * @param {Array} defaultData - 缓存不存在时返回的默认数组。
     * @returns {Array} 缓存中的数组数据，或传入的默认数组。
     */
    static loadCachedList(cacheKey, defaultData = []) {
        const cached = CacheManager.load(cacheKey);
        return cached || defaultData;
    }

    /**
     * 从缓存中读取任意结构的数据，如果缓存不存在则返回传入的默认值。
     * @param {string} cacheKey - CacheManager 使用的缓存键名。
     * @param {*} defaultData - 缓存不存在时返回的默认数据。
     * @returns {*} 缓存中的数据，或传入的默认数据。
     */
    static loadCachedValue(cacheKey, defaultData = null) {
        const cached = CacheManager.load(cacheKey);
        return cached || defaultData;
    }

    /**
     * 按统一流程加载任意远程数据，并在失败时保留当前内存数据或回退数据。
     * @param {Object} options - 远程加载配置对象。
     * @param {*} options.currentData - 当前内存中的数据。
     * @param {boolean} options.forceRefresh - 是否强制跳过内存和缓存读取。
     * @param {Object|null} options.supabase - Supabase 客户端实例。
     * @param {string} options.cacheKey - CacheManager 使用的缓存键名。
     * @param {Function} options.fetcher - 远程数据加载函数，返回已经映射好的前端数据。
     * @param {*} options.fallbackData - 没有 Supabase 或加载失败时使用的回退数据。
     * @param {string} options.logLabel - 日志标签，用于定位加载失败来源。
     * @returns {Promise<*>} 加载后的数据；失败时返回 currentData 或 fallbackData。
     */
    static async loadRemoteValue(options) {
        if (options.currentData && !options.forceRefresh) {
            return options.currentData;
        }

        if (!options.forceRefresh) {
            const cached = CacheManager.load(options.cacheKey);
            if (cached) {
                return cached;
            }
        }

        if (!options.supabase) {
            return options.currentData || options.fallbackData;
        }

        try {
            const remoteData = await options.fetcher();
            CacheManager.save(options.cacheKey, remoteData);
            return remoteData;
        } catch (error) {
            console.error(`${options.logLabel}: 从 Supabase 加载失败:`, error);
            return options.currentData || options.fallbackData;
        }
    }

    /**
     * 按统一流程加载 Supabase 列表数据，并在失败时保留当前内存数据。
     * @param {Object} options - 列表加载配置对象。
     * @param {Array} options.currentData - 当前内存中的列表数据。
     * @param {boolean} options.forceRefresh - 是否强制跳过内存和缓存读取。
     * @param {Object|null} options.supabase - Supabase 客户端实例。
     * @param {string} options.cacheKey - CacheManager 使用的缓存键名。
     * @param {string} options.tableName - Supabase 表名。
     * @param {string} options.orderColumn - 排序字段名。
     * @param {boolean} options.ascending - 是否升序排序。
     * @param {Function} options.mapItem - 单条数据库记录到前端数据结构的映射函数。
     * @param {string} options.logLabel - 日志标签，用于定位加载失败来源。
     * @returns {Promise<Array>} 加载后的列表数据；失败时返回 currentData 或空数组。
     */
    static async loadSupabaseList(options) {
        const currentData = options.currentData || [];

        if (currentData.length > 0 && !options.forceRefresh) {
            return currentData;
        }

        if (!options.forceRefresh) {
            const cached = CacheManager.load(options.cacheKey);
            if (cached) {
                return cached;
            }
        }

        if (!options.supabase) {
            return currentData;
        }

        try {
            const { data, error } = await options.supabase
                .from(options.tableName)
                .select('*')
                .order(options.orderColumn, { ascending: options.ascending });

            if (error) throw error;

            const mappedData = (data || []).map(options.mapItem);
            CacheManager.save(options.cacheKey, mappedData);
            return mappedData;
        } catch (error) {
            console.error(`${options.logLabel}: 从 Supabase 加载失败:`, error);
            return currentData;
        }
    }
}
