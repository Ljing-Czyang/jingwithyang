const GITHUB_CONFIG = {
    owner: 'Ljing-Czyang',
    repo: 'jingwithyang',
    branch: 'main',
    uploadsPath: 'uploads',
    indexPath: 'data/photos.json',
    cdnBase: 'https://cdn.jsdelivr.net/gh/Ljing-Czyang/jingwithyang@main/'
};

class StorageManager {
    constructor() {
        this.photos = [];
        this.indexSha = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        const token = this.getToken();
        if (token) {
            await this.loadPhotosFromGitHub();
        } else {
            this.loadPhotosFromLocal();
        }
        this.initialized = true;
    }

    getToken() {
        return localStorage.getItem('gh_token');
    }

    hasToken() {
        return !!this.getToken();
    }

    loadPhotosFromLocal() {
        const data = localStorage.getItem('our_memory_photos');
        if (data) {
            try {
                this.photos = JSON.parse(data);
            } catch (e) {
                console.error('读取本地照片数据失败:', e);
                this.photos = [];
            }
        }
    }

    savePhotosToLocal() {
        localStorage.setItem('our_memory_photos', JSON.stringify(this.photos));
    }

    async loadPhotosFromGitHub() {
        try {
            const response = await fetch(`${GITHUB_CONFIG.cdnBase}data/photos.json?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                this.photos = data.photos || [];
                this.indexSha = data.sha;
            } else {
                this.photos = [];
            }
        } catch (e) {
            console.error('从 GitHub 加载照片索引失败:', e);
            this.loadPhotosFromLocal();
        }
    }

    getCdnUrl(relativePath) {
        return `${GITHUB_CONFIG.cdnBase}${relativePath}`;
    }

    async uploadPhoto(file, dateStr, title, description, uploader) {
        ImageUtils.validateFile(file);

        const token = this.getToken();
        if (!token) {
            return this.uploadPhotoLocal(file, dateStr, title, description, uploader);
        }

        return await this.uploadPhotoToGitHub(file, dateStr, title, description, uploader, token);
    }

    async uploadPhotoLocal(file, dateStr, title, description, uploader) {
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
            isPrivate: false,
            isLocal: true
        };

        this.photos.unshift(photo);
        this.savePhotosToLocal();
        return photo;
    }

    async uploadPhotoToGitHub(file, dateStr, title, description, uploader, token) {
        const photoId = `photo_${Date.now()}`;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const ext = file.name.split('.').pop().toLowerCase() || 'webp';
        const fileName = `${photoId}.${ext}`;
        const relativePath = `${GITHUB_CONFIG.uploadsPath}/${year}/${month}/${fileName}`;

        const uploaderInfo = {
            jing: { id: 'user_001', name: '境', avatar: '❤️' },
            yang: { id: 'user_002', name: '扬', avatar: '💛' }
        };
        const info = uploaderInfo[uploader] || uploaderInfo.jing;

        const arrayBuffer = await file.arrayBuffer();
        const base64Content = btoa(
            new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        );

        const uploadResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${relativePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload photo: ${dateStr}`,
                    content: base64Content,
                    branch: GITHUB_CONFIG.branch
                })
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.message || '上传图片失败');
        }

        const thumbnail = await ImageUtils.generateThumbnail(file);

        const photo = {
            id: photoId,
            date: dateStr,
            title: title || '',
            description: description || '',
            imageUrl: relativePath,
            thumbnailUrl: thumbnail,
            uploadedBy: info.id,
            uploadedByName: info.name,
            uploadedByAvatar: info.avatar,
            createdAt: new Date().toISOString(),
            isPrivate: false,
            isLocal: false
        };

        this.photos.unshift(photo);
        await this.updateIndexOnGitHub(token);

        return photo;
    }

    async updateIndexOnGitHub(token) {
        const indexPath = GITHUB_CONFIG.indexPath;
        const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${indexPath}`;

        let sha = this.indexSha;
        if (!sha) {
            try {
                const getResponse = await fetch(apiUrl, {
                    headers: { 'Authorization': `token ${token}` }
                });
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                console.log('索引文件不存在，将创建新文件');
            }
        }

        const content = btoa(unescape(encodeURIComponent(JSON.stringify({ photos: this.photos }, null, 2))));

        const body = {
            message: 'Update photos index',
            content: content,
            branch: GITHUB_CONFIG.branch
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '更新索引失败');
        }

        const result = await response.json();
        this.indexSha = result.content.sha;
    }

    getPhotos() {
        return this.photos.map(photo => {
            if (!photo.isLocal && photo.imageUrl && !photo.imageUrl.startsWith('data:')) {
                return {
                    ...photo,
                    imageUrl: this.getCdnUrl(photo.imageUrl)
                };
            }
            return photo;
        });
    }

    getPhotosByDate(dateStr) {
        return this.getPhotos().filter(p => p.date === dateStr);
    }

    async deletePhoto(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (!photo) return;

        const token = this.getToken();
        
        if (token && !photo.isLocal && photo.imageUrl && !photo.imageUrl.startsWith('data:')) {
            try {
                const relativePath = photo.imageUrl.replace(GITHUB_CONFIG.cdnBase, '');
                await this.deleteFileFromGitHub(relativePath, token);
                this.photos = this.photos.filter(p => p.id !== photoId);
                await this.updateIndexOnGitHub(token);
            } catch (e) {
                console.error('从 GitHub 删除照片失败:', e);
            }
        } else {
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.savePhotosToLocal();
        }
    }

    async deleteFileFromGitHub(path, token) {
        const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
        
        const getResponse = await fetch(apiUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (!getResponse.ok) return;
        
        const data = await getResponse.json();
        
        await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete photo: ${path}`,
                sha: data.sha,
                branch: GITHUB_CONFIG.branch
            })
        });
    }

    togglePrivacy(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (photo) {
            photo.isPrivate = !photo.isPrivate;
            this.savePhotosToLocal();
        }
    }

    async refresh() {
        if (this.getToken()) {
            await this.loadPhotosFromGitHub();
        } else {
            this.loadPhotosFromLocal();
        }
    }
}

const storage = new StorageManager();
