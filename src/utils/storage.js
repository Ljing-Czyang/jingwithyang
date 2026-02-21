class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'our_memory_photos';
        this.photos = this.loadPhotos();
    }

    loadPhotos() {
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

    savePhotos() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.photos));
    }

    async uploadPhoto(file, dateStr, title, description) {
        ImageUtils.validateFile(file);

        const photoId = `photo_${Date.now()}`;
        const imageData = await ImageUtils.fileToBase64(file);
        const thumbnail = await ImageUtils.generateThumbnail(file);

        const photo = {
            id: photoId,
            date: dateStr,
            title: title || '',
            description: description || '',
            imageUrl: imageData,
            thumbnailUrl: thumbnail,
            uploadedBy: 'user_001',
            uploadedByName: '境',
            uploadedByAvatar: '❤️',
            createdAt: new Date().toISOString(),
            isPrivate: false
        };

        this.photos.unshift(photo);
        this.savePhotos();
        return photo;
    }

    getPhotos() {
        return this.photos;
    }

    getPhotosByDate(dateStr) {
        return this.photos.filter(p => p.date === dateStr);
    }

    deletePhoto(photoId) {
        this.photos = this.photos.filter(p => p.id !== photoId);
        this.savePhotos();
    }

    togglePrivacy(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (photo) {
            photo.isPrivate = !photo.isPrivate;
            this.savePhotos();
        }
    }
}

const storage = new StorageManager();
