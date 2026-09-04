class StorageManager {
    constructor() {
        this.supabase = null;
        this.photos = [];
        this.initialized = false;
        this.initSupabase();
    }

    toSnakeCase(obj) {
        const snakeObj = {};
        for (const key in obj) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            snakeObj[snakeKey] = obj[key];
        }
        return snakeObj;
    }

    toCamelCase(obj) {
        const camelObj = {};
        for (const key in obj) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            camelObj[camelKey] = obj[key];
        }
        return camelObj;
    }

    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
            if (this.supabase) {
                this.initialized = true;
            } else {
                console.warn('Supabase 未配置，使用本地存储作为后备方案');
                this.STORAGE_KEY = 'our_memory_photos';
                this.photos = this.loadPhotosFromLocal();
            }
        } catch (error) {
            console.error('初始化 Supabase 失败，使用本地存储:', error);
            this.STORAGE_KEY = 'our_memory_photos';
            this.photos = this.loadPhotosFromLocal();
        }
    }

    isUsingSupabase() {
        return this.initialized && this.supabase !== null;
    }

    loadPhotosFromLocal() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('读取照片数据失败:', e);
            }
        }
        return [];
    }

    savePhotosToLocal() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.photos));
        } catch (error) {
            console.error('保存照片数据失败:', error);
            if (error.name === 'QuotaExceededError') {
                alert('存储空间已满！请删除一些照片后再试。');
            }
            throw error;
        }
    }

    /**
     * 上传或本地保存一张照片，支持普通照片和由组图工具生成的高清图片。
     * @param {File} file 需要保存的图片文件。
     * @param {string} dateStr 图片关联日期，格式通常为 YYYY-MM-DD。
     * @param {string} title 图片标题，可为空字符串。
     * @param {string} description 图片描述，可为空字符串。
     * @param {string} uploader 上传者 key，对应 CONFIG.users 中的用户。
     * @param {Object} options 保存选项，maxSize 表示允许的最大字节数，skipValidation 表示是否跳过文件校验。
     * @returns {Promise<Object>} 返回保存后的照片数据对象。
     */
    async uploadPhoto(file, dateStr, title, description, uploader, options = {}) {
        if (!options.skipValidation) {
            ImageUtils.validateFile(file, { maxSize: options.maxSize });
        }

        const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const info = CONFIG.users[uploader] || CONFIG.users.jing;

        if (this.isUsingSupabase()) {
            const fileName = file.name || 'image.jpg';
            const fileExt = fileName.split('.').pop() || 'jpg';
            const safeFileName = `${photoId}.${fileExt}`;
            const safeThumbnailFileName = `${photoId}_thumb.${fileExt}`;

            console.log('开始上传原图, 文件大小:', file.size, 'bytes, 类型:', file.type);

            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(CONFIG.supabase.storageBucket)
                .upload(`images/${safeFileName}`, file);

            if (uploadError) {
                console.error('上传原图失败:', uploadError);
                throw new Error('上传原图失败: ' + uploadError.message);
            }

            console.log('原图上传成功:', uploadData);

            let thumbnailBlob;
            try {
                const thumbnail = await ImageUtils.generateThumbnail(file);
                thumbnailBlob = this.dataURLtoBlob(thumbnail);
                console.log('缩略图生成成功, 大小:', thumbnailBlob.size, 'bytes');
            } catch (thumbError) {
                console.error('生成缩略图失败:', thumbError);
                throw new Error('生成缩略图失败: ' + thumbError.message);
            }

            const { error: thumbUploadError } = await this.supabase.storage
                .from(CONFIG.supabase.storageBucket)
                .upload(`thumbnails/${safeThumbnailFileName}`, thumbnailBlob);

            if (thumbUploadError) {
                console.error('上传缩略图失败:', thumbUploadError);
                throw new Error('上传缩略图失败: ' + thumbUploadError.message);
            }

            console.log('缩略图上传成功');

            const { data: imageUrlData } = this.supabase.storage
                .from(CONFIG.supabase.storageBucket)
                .getPublicUrl(`images/${safeFileName}`);

            const { data: thumbnailUrlData } = this.supabase.storage
                .from(CONFIG.supabase.storageBucket)
                .getPublicUrl(`thumbnails/${safeThumbnailFileName}`);

            const photo = {
                id: photoId,
                date: dateStr || '',
                title: title || '',
                description: description || '',
                imageUrl: imageUrlData?.publicUrl || '',
                thumbnailUrl: thumbnailUrlData?.publicUrl || '',
                uploadedBy: info.id,
                uploadedByName: info.name,
                uploadedByAvatar: info.avatar,
                createdAt: new Date().toISOString(),
                isPrivate: false
            };

            const { error: dbError } = await this.supabase
                .from(CONFIG.supabase.tableName)
                .insert([this.toSnakeCase(photo)]);

            if (dbError) {
                console.error('保存数据库失败:', dbError);
                throw new Error('保存数据库失败: ' + dbError.message);
            }

            console.log('照片记录保存成功');
            this.photos.unshift(photo);
            return photo;
        } else {
            const imageData = await ImageUtils.fileToBase64(file);
            const thumbnail = await ImageUtils.generateThumbnail(file);

            const photo = {
                id: photoId,
                date: dateStr || '',
                title: title || '',
                description: description || '',
                imageUrl: imageData,
                thumbnailUrl: thumbnail,
                uploadedBy: info.id,
                uploadedByName: info.name,
                uploadedByAvatar: info.avatar,
                createdAt: new Date().toISOString(),
                isPrivate: false
            };

            this.photos.unshift(photo);
            this.savePhotosToLocal();
            return photo;
        }
    }

    dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    async getPhotos() {
        if (this.isUsingSupabase()) {
            const { data, error } = await this.supabase
                .from(CONFIG.supabase.tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('获取照片失败:', error);
                return this.photos;
            }

            this.photos = (data || []).map(item => this.toCamelCase(item));
            return this.photos;
        } else {
            return this.photos;
        }
    }

    async getPhotosByDate(dateStr) {
        if (this.isUsingSupabase()) {
            const { data, error } = await this.supabase
                .from(CONFIG.supabase.tableName)
                .select('*')
                .eq('date', dateStr)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('获取照片失败:', error);
                return this.photos.filter(p => p.date === dateStr);
            }

            return (data || []).map(item => this.toCamelCase(item));
        } else {
            return this.photos.filter(p => p.date === dateStr);
        }
    }

    async deletePhoto(photoId) {
        if (this.isUsingSupabase()) {
            const photo = this.photos.find(p => p.id === photoId);
            if (photo) {
                try {
                    if (photo.imageUrl) {
                        const fileName = photo.imageUrl.split('/').pop();
                        const thumbFileName = photo.thumbnailUrl ? photo.thumbnailUrl.split('/').pop() : null;
                        
                        const filesToRemove = [];
                        if (fileName) filesToRemove.push(`images/${fileName}`);
                        if (thumbFileName) filesToRemove.push(`thumbnails/${thumbFileName}`);
                        
                        if (filesToRemove.length > 0) {
                            await this.supabase.storage
                                .from(CONFIG.supabase.storageBucket)
                                .remove(filesToRemove);
                        }
                    }
                } catch (storageError) {
                    console.warn('删除存储文件失败，继续删除数据库记录:', storageError);
                }

                const { error } = await this.supabase
                    .from(CONFIG.supabase.tableName)
                    .delete()
                    .eq('id', photoId);

                if (error) throw error;
            }

            this.photos = this.photos.filter(p => p.id !== photoId);
        } else {
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.savePhotosToLocal();
        }
    }

    async togglePrivacy(photoId) {
        if (this.isUsingSupabase()) {
            const photo = this.photos.find(p => p.id === photoId);
            if (photo) {
                photo.isPrivate = !photo.isPrivate;
                const { error } = await this.supabase
                    .from(CONFIG.supabase.tableName)
                    .update({ is_private: photo.isPrivate })
                    .eq('id', photoId);

                if (error) throw error;
            }
        } else {
            const photo = this.photos.find(p => p.id === photoId);
            if (photo) {
                photo.isPrivate = !photo.isPrivate;
                this.savePhotosToLocal();
            }
        }
    }

    async refreshPhotos() {
        await this.getPhotos();
    }
}

const storage = new StorageManager();
