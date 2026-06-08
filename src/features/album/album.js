class AlbumFeature {
    constructor() {
        this.currentFilter = 'all';
        this.photos = [];
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
                        ${UIUtils.getLoadingView()}
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

        const sortedPhotos = this.getSortedPhotos();
        const groupedPhotos = this.groupPhotosByDate(sortedPhotos);

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

        if (sortedPhotos.length === 0) {
            html += `
                <div class="album-empty">
                    <div class="album-empty-icon">📷</div>
                    <p>还没有照片哦</p>
                    <p class="album-empty-hint">去日历上传第一张照片吧~</p>
                </div>
            `;
        } else if (this.currentFilter === 'all') {
            html += `<div class="album-photo-grid">`;
            sortedPhotos.forEach(photo => {
                html += this.renderPhotoCard(photo);
            });
            html += `</div>`;
        } else {
            groupedPhotos.forEach(({ date, photos }) => {
                html += `
                    <div class="album-date-group">
                        <div class="album-date-title">📅 ${date}</div>
                        <div class="album-photo-grid">
                `;
                photos.forEach(photo => {
                    html += this.renderPhotoCard(photo);
                });
                html += `
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderPhotoCard(photo) {
        const thumbnailUrl = UIUtils.escapeHtml(photo.thumbnailUrl);
        const title = UIUtils.escapeHtml(photo.title || '照片');

        return `
            <div class="album-photo-item" onclick="albumFeature.showPhotoDetail('${photo.id}')">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                <div class="album-photo-overlay">
                    <span class="album-photo-avatar">${UIUtils.escapeHtml(photo.uploadedByAvatar)}</span>
                </div>
            </div>
        `;
    }

    getPhotoSortValue(photo) {
        return photo.createdAt || photo.created_at || photo.date || '';
    }

    getSortedPhotos() {
        return [...this.photos].sort((a, b) => {
            return this.getPhotoSortValue(b).localeCompare(this.getPhotoSortValue(a));
        });
    }

    groupPhotosByDate(photos = this.getSortedPhotos()) {
        const grouped = new Map();

        photos.forEach(photo => {
            if (!grouped.has(photo.date)) {
                grouped.set(photo.date, []);
            }
            grouped.get(photo.date).push(photo);
        });

        return Array.from(grouped.entries()).map(([date, groupedPhotos]) => ({
            date,
            photos: groupedPhotos
        }));
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderAlbumView();
    }

    async showPhotoDetail(photoId) {
        let photo = this.photos.find(p => p.id === photoId);
        if (!photo) {
            this.photos = await storage.getPhotos();
            photo = this.photos.find(p => p.id === photoId);
        }
        if (!photo) return;

        const title = UIUtils.escapeHtml(photo.title || '照片');
        const imageUrl = UIUtils.escapeHtml(photo.imageUrl);
        const date = UIUtils.escapeHtml(photo.date);
        const description = UIUtils.escapeHtml(photo.description || '');
        const uploaderAvatar = UIUtils.escapeHtml(photo.uploadedByAvatar);
        const uploaderName = UIUtils.escapeHtml(photo.uploadedByName);

        const modal = document.createElement('div');
        modal.className = 'photo-detail-modal';
        modal.innerHTML = `
            <div class="photo-detail-content">
                <div class="photo-detail-header">
                    <h3>📷 ${title}</h3>
                    <button onclick="this.closest('.photo-detail-modal').remove()">✕</button>
                </div>
                <div class="photo-detail-body">
                    <img src="${imageUrl}" alt="${title}" loading="lazy">
                    <div class="photo-detail-info">
                        <div class="photo-detail-date">📅 ${date}</div>
                        ${description ? `<div class="photo-detail-desc">${description}</div>` : ''}
                        <div class="photo-detail-uploader">
                            <span class="uploader-avatar">${uploaderAvatar}</span>
                            <span class="uploader-name">${uploaderName}</span>
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
