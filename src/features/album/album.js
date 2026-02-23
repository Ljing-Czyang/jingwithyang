class AlbumFeature {
    constructor() {
        this.currentFilter = 'all';
        this.photos = [];
    }

    renderLoadingView() {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px;">
                <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #ff6b6b; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #888; margin-top: 20px; font-size: 16px;">加载中...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    async show() {
        const container = document.getElementById('view-album');
        if (container) {
            container.innerHTML = `
                <div class="album-container">
                    <div class="album-header">
                        <h3>📷 我们的相册</h3>
                    </div>
                    <div class="album-content">
                        ${this.renderLoadingView()}
                    </div>
                </div>
            `;
        }
        
        try {
            this.photos = await storage.getPhotos();
            this.renderAlbumView();
        } catch (error) {
            console.error('加载相册失败:', error);
            if (container) {
                container.innerHTML = `
                    <div class="album-container">
                        <div class="album-header">
                            <h3>📷 我们的相册</h3>
                        </div>
                        <div class="album-content" style="display: flex; align-items: center; justify-content: center; padding: 80px 20px;">
                            <p style="color: #ff6b6b; text-align: center;">加载失败，请刷新重试</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    renderAlbumView() {
        const container = document.getElementById('view-album');
        if (!container) return;

        const groupedPhotos = this.groupPhotosByDate();

        let html = `
            <div class="album-container">
                <div class="album-header">
                    <h3>📷 我们的相册</h3>
                    <div class="album-filters">
                        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="albumFeature.setFilter('all')">全部</button>
                        <button class="filter-btn ${this.currentFilter === 'by-date' ? 'active' : ''}" onclick="albumFeature.setFilter('by-date')">按日期</button>
                    </div>
                </div>
                <div class="album-content">
        `;

        if (Object.keys(groupedPhotos).length === 0) {
            html += `
                <div class="album-empty">
                    <div class="album-empty-icon">📷</div>
                    <p>还没有照片哦</p>
                    <p class="album-empty-hint">去日历上传第一张照片吧~</p>
                </div>
            `;
        } else {
            for (const [date, photos] of Object.entries(groupedPhotos)) {
                html += `
                    <div class="album-date-group">
                        <div class="album-date-title">📅 ${date}</div>
                        <div class="album-photo-grid">
                `;
                photos.forEach(photo => {
                    html += `
                        <div class="album-photo-item" onclick="albumFeature.showPhotoDetail('${photo.id}')">
                            <img src="${photo.thumbnailUrl}" alt="${photo.title}">
                            <div class="album-photo-overlay">
                                <span class="album-photo-avatar">${photo.uploadedByAvatar}</span>
                            </div>
                        </div>
                    `;
                });
                html += `
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    groupPhotosByDate() {
        const grouped = {};
        this.photos.forEach(photo => {
            if (!grouped[photo.date]) {
                grouped[photo.date] = [];
            }
            grouped[photo.date].push(photo);
        });
        return grouped;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderAlbumView();
    }

    async showPhotoDetail(photoId) {
        const photos = await storage.getPhotos();
        const photo = photos.find(p => p.id === photoId);
        if (!photo) return;

        const modal = document.createElement('div');
        modal.className = 'photo-detail-modal';
        modal.innerHTML = `
            <div class="photo-detail-content">
                <div class="photo-detail-header">
                    <h3>📷 ${photo.title || '照片'}</h3>
                    <button onclick="this.closest('.photo-detail-modal').remove()">✕</button>
                </div>
                <div class="photo-detail-body">
                    <img src="${photo.imageUrl}" alt="${photo.title}">
                    <div class="photo-detail-info">
                        <div class="photo-detail-date">📅 ${photo.date}</div>
                        ${photo.description ? `<div class="photo-detail-desc">${photo.description}</div>` : ''}
                        <div class="photo-detail-uploader">
                            <span class="uploader-avatar">${photo.uploadedByAvatar}</span>
                            <span class="uploader-name">${photo.uploadedByName}</span>
                        </div>
                    </div>
                </div>
                <div class="photo-detail-footer">
                    <button class="btn-delete-photo" onclick="albumFeature.deletePhoto('${photo.id}', this.closest('.photo-detail-modal'))">🗑️ 删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async deletePhoto(photoId, modal) {
        if (confirm('确定要删除这张照片吗？')) {
            await storage.deletePhoto(photoId);
            this.photos = this.photos.filter(p => p.id !== photoId);
            if (modal) modal.remove();
            await this.show();
        }
    }

    async refresh() {
        await this.show();
    }
}

const albumFeature = new AlbumFeature();