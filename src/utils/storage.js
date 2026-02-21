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

    async uploadPhoto(file, dateStr, title, description, uploader) {
        ImageUtils.validateFile(file);

        const photoId = `photo_${Date.now()}`;
        const imageData = await ImageUtils.fileToBase64(file);
        const thumbnail = await ImageUtils.generateThumbnail(file);

        const uploaderInfo = {
            jing: { id: 'user_001', name: '境', avatar: '❤️' },
            yang: { id: 'user_002', name: '扬', avatar: '💛' }
        };

        const info = uploaderInfo[uploader] || uploaderInfo.jing;

        const photo = {
            id: photoId,
            date: dateStr,
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
