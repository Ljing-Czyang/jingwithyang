class AlbumFeature {
    constructor() {
        this.currentFilter = 'all';
        this.photos = [];
        this.displayCount = 20;
        this.isLoading = false;
    }

    show() {
        this.photos = storage.getPhotos();
        this.displayCount = 20;
        this.renderAlbumView();
        this.setupScrollListener();
    }

    setupScrollListener() {
        const container = document.querySelector('.album-content');
        if (!container) return;

        const scrollContent = document.querySelector('.scroll-content');
        if (!scrollContent) return;

        scrollContent.removeEventListener('scroll', this.handleScroll);
        this.handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContent;
            if (scrollTop + clientHeight >= scrollHeight - 200 && !this.isLoading) {
                this.loadMore();
            }
        };
        scrollContent.addEventListener('scroll', this.handleScroll);
    }

    loadMore() {
        const totalPhotos = this.photos.length;
        const currentDisplayed = document.querySelectorAll('.album-photo-item').length;
        
        if (currentDisplayed >= totalPhotos) return;

        this.isLoading = true;
        this.showLoadingIndicator();

        setTimeout(() => {
            this.displayCount += 20;
            this.renderAlbumView(false);
            this.hideLoadingIndicator();
            this.isLoading = false;
        }, 300);
    }

    showLoadingIndicator() {
        const container = document.querySelector('.album-content');
        if (!container) return;

        let loader = document.getElementById('album-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'album-loader';
            loader.className = 'album-loader';
            loader.innerHTML = '<div class="album-loader-spinner"></div><span>加载更多...</span>';
            container.appendChild(loader);
        }
    }

    hideLoadingIndicator() {
        const loader = document.getElementById('album-loader');
        if (loader) loader.remove();
    }

    renderAlbumView(full = true) {
        const container = document.getElementById('view-album');
        if (!container) return;

        if (full) {
            const groupedPhotos = this.groupPhotosByDate();
            const photosToShow = this.photos.slice(0, this.displayCount);
            const groupedToShow = this.groupPhotosByDateList(photosToShow);

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

            if (Object.keys(groupedToShow).length === 0) {
                html += `
                    <div class="album-empty">
                        <div class="album-empty-icon">📷</div>
                        <p>还没有照片哦</p>
                        <p class="album-empty-hint">去日历上传第一张照片吧~</p>
                    </div>
                `;
            } else {
                for (const [date, photos] of Object.entries(groupedToShow)) {
                    html += `
                        <div class="album-date-group">
                            <div class="album-date-title">📅 ${date}</div>
                            <div class="album-photo-grid">
                    `;
                    photos.forEach(photo => {
                        html += `
                            <div class="album-photo-item" onclick="albumFeature.showPhotoDetail('${photo.id}')">
                                <img src="${photo.thumbnailUrl}" alt="${photo.title}" loading="lazy">
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

                if (this.photos.length > this.displayCount) {
                    html += `<div class="album-more-hint">已显示 ${this.displayCount} / ${this.photos.length} 张照片</div>`;
                }
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }
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

    groupPhotosByDateList(photos) {
        const grouped = {};
        photos.forEach(photo => {
            if (!grouped[photo.date]) {
                grouped[photo.date] = [];
            }
            grouped[photo.date].push(photo);
        });
        return grouped;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.displayCount = 20;
        this.renderAlbumView();
        this.setupScrollListener();
    }

    showPhotoDetail(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
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
            if (modal) modal.remove();
            this.show();
        }
    }

    refresh() {
        this.photos = storage.getPhotos();
        this.displayCount = 20;
        this.renderAlbumView();
        this.setupScrollListener();
    }
}

const albumFeature = new AlbumFeature();
