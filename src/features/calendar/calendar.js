class CoupleCalendar {
    constructor() {
        this.currentDate = new Date();
        this.cachedPhotos = [];
    }

    clearTransientModals() {
        document.querySelectorAll('.date-detail-modal, .date-photos-modal, .upload-modal, .photo-detail-modal').forEach(el => el.remove());
    }

    getPhotoDateSet(photos = []) {
        return new Set(photos.filter(photo => photo.date).map(photo => photo.date));
    }

    async renderCalendarView() {
        const container = document.getElementById('calendar-container');
        if (!container) return;
        
        container.innerHTML = `
            <h3>📅 我们的日历</h3>
            ${UIUtils.getLoadingView()}
        `;
        
        try {
            const allPhotos = await storage.getPhotos();
            this.cachedPhotos = allPhotos;
            container.innerHTML = `
                <h3>📅 我们的日历</h3>
                ${this.render(allPhotos)}
                <div class="calendar-events">
                    <h4>📌 重要日期</h4>
                    ${this.renderSpecialDates()}
                </div>
            `;
        } catch (error) {
            console.error('加载日历失败:', error);
            container.innerHTML = `
                <h3>📅 我们的日历</h3>
                <p style="color: #ff6b6b; text-align: center; padding: 40px;">加载失败，请刷新重试</p>
            `;
        }
    }

    async show() {
        const modal = document.createElement('div');
        modal.className = 'calendar-modal';
        modal.innerHTML = `
            <div class="calendar-modal-content">
                <div class="calendar-modal-header">
                    <h3>📅 我们的日历</h3>
                    <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                </div>
                ${UIUtils.getLoadingView()}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        try {
            const allPhotos = await storage.getPhotos();
            this.cachedPhotos = allPhotos;
            const calendarContent = modal.querySelector('.calendar-modal-content');
            if (calendarContent) {
                calendarContent.innerHTML = `
                    <div class="calendar-modal-header">
                        <h3>📅 我们的日历</h3>
                        <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                    </div>
                    ${this.render(allPhotos)}
                    <div class="calendar-events">
                        <h4>📌 重要日期</h4>
                        ${this.renderSpecialDates()}
                    </div>
                `;
            }
        } catch (error) {
            console.error('加载日历失败:', error);
            const calendarContent = modal.querySelector('.calendar-modal-content');
            if (calendarContent) {
                calendarContent.innerHTML = `
                    <div class="calendar-modal-header">
                        <h3>📅 我们的日历</h3>
                        <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                    </div>
                    <p style="color: #ff6b6b; text-align: center; padding: 40px;">加载失败，请重试</p>
                `;
            }
        }
    }

    render(photos = []) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const photoDateSet = this.getPhotoDateSet(photos);
        
        let html = `
            <div class="calendar-header">
                <button onclick="calendar.changeMonth(-1)">◀</button>
                <span>${year}年${month + 1}月</span>
                <button onclick="calendar.changeMonth(1)">▶</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">日</div>
                <div class="calendar-day-header">一</div>
                <div class="calendar-day-header">二</div>
                <div class="calendar-day-header">三</div>
                <div class="calendar-day-header">四</div>
                <div class="calendar-day-header">五</div>
                <div class="calendar-day-header">六</div>
        `;
        
        for (let i = 0; i < startDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            
            const isToday = isSameDay(date, new Date());
            const isSpecial = this.isSpecialDate(dateStr);
            const isAnniversary = day === CONFIG.monthlyAnniversary;
            const hasPhotos = photoDateSet.has(dateStr);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSpecial) classes += ' special';
            if (isAnniversary) classes += ' anniversary';
            if (hasPhotos) classes += ' has-photos';
            
            html += `<div class="${classes}" onclick="calendar.showDateDetails('${dateStr}')">
                ${day}
                ${hasPhotos ? '<div class="photo-indicator"></div>' : ''}
            </div>`;
        }
        
        html += '</div>';
        
        return html;
    }

    async changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        await this.updateCalendar();
    }

    async updateCalendar() {
        const calendarContent = document.querySelector('.calendar-modal-content');
        const photosToUse = this.cachedPhotos.length > 0 ? this.cachedPhotos : await storage.getPhotos();
        
        if (calendarContent) {
            const newCalendar = this.render(photosToUse);
            calendarContent.innerHTML = `
                <div class="calendar-modal-header">
                    <h3>📅 我们的时光</h3>
                    <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                </div>
                ${newCalendar}
                <div class="calendar-events">
                    <h4>📌 重要日期</h4>
                    ${this.renderSpecialDates()}
                </div>
            `;
        } else {
            await this.renderCalendarView();
        }
    }

    renderSpecialDates() {
        let html = '<div class="special-dates-list">';
        
        CONFIG.specialDates.forEach(item => {
            html += `
                <div class="special-date-item">
                    <span class="special-date-title">${item.title}</span>
                    <span class="special-date-date">${item.date}</span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    async showDateDetails(dateStr) {
        this.clearTransientModals();
        
        const specialDate = CONFIG.specialDates.find(d => d.date === dateStr);
        const event = CONFIG.events.find(e => e.date === dateStr);
        const photos = await storage.getPhotosByDate(dateStr);
        
        const startDate = new Date(CONFIG.startDate);
        const currentDate = new Date(dateStr);
        const days = calculateDaysBetween(startDate, currentDate);
        
        let html = `
            <div class="date-detail-modal" id="date-detail-${dateStr}">
                <div class="date-detail-content">
                    <div class="date-detail-header">
                        <h3>📅 ${dateStr}</h3>
                        <button onclick="this.closest('.date-detail-modal').remove()">✕</button>
                    </div>
                    <div class="date-detail-body">
        `;
        
        if (specialDate) {
            html += `
                <div class="date-detail-item special">
                    <span class="date-detail-icon">${specialDate.title.split(' ')[0]}</span>
                    <span class="date-detail-text">${specialDate.title.substring(2)}</span>
                </div>
            `;
        }
        
        if (event) {
            html += `
                <div class="date-detail-item">
                    <span class="date-detail-icon">📝</span>
                    <span class="date-detail-text">${event.title}</span>
                </div>
            `;
        }
        
        if (days > 0) {
            html += `
                <div class="date-detail-item love-days">
                    <span class="date-detail-icon">💕</span>
                    <span class="date-detail-text">恋爱第 <strong>${days}</strong> 天</span>
                </div>
            `;
        }
        
        if (!specialDate && !event && days <= 0) {
            html += `<div class="date-detail-empty">暂无记录</div>`;
        }
        
        html += `
                    </div>
                    <div class="date-detail-footer">
                        <button class="btn-view-photos" onclick="calendar.showDatePhotos('${dateStr}', this.closest('.date-detail-modal'))">📷 查看照片 (${photos.length})</button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);
    }

    async showDatePhotos(dateStr, dateModal) {
        this.clearTransientModals();

        const photos = await storage.getPhotosByDate(dateStr);

        let html = `
            <div class="date-photos-modal" id="date-photos-${dateStr}">
                <div class="date-photos-content">
                    <div class="date-photos-header">
                        <button class="btn-back" onclick="calendar.closeDatePhotos('${dateStr}')">◀ 返回</button>
                        <h3>📷 ${dateStr} 的照片</h3>
                        <div style="width: 60px;"></div>
                    </div>
                    <div class="date-photos-body">
        `;

        if (photos.length > 0) {
            html += `<div class="date-photos-grid-full">`;
            photos.forEach((photo, index) => {
                html += `
                    <div class="date-photo-item-full" onclick="calendar.showPhotoDetail('${photo.id}', '${dateStr}')">
                        <div class="img-skeleton"></div>
                        <img data-src="${photo.thumbnailUrl}" alt="${photo.title}"
                             loading="lazy"
                             onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2214%22>加载失败</text></svg>'">
                        <div class="date-photo-overlay-full">
                            <span class="date-photo-avatar-full">${photo.uploadedByAvatar}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            html += `
                <div class="date-photos-empty">
                    <div class="date-photos-empty-icon">📷</div>
                    <p>这一天还没有照片</p>
                    <p class="date-photos-empty-hint">上传第一张照片吧~</p>
                </div>
            `;
        }

        html += `
                    </div>
                    <div class="date-photos-footer">
                        <button class="btn-upload-photo" onclick="calendar.showUploadModal('${dateStr}')">📤 上传照片</button>
                    </div>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);

        this.initLazyLoad(modal);
    }

    async closeDatePhotos(dateStr) {
        this.clearTransientModals();
        await this.showDateDetails(dateStr);
    }

    async showPhotoDetail(photoId, dateStr) {
        this.clearTransientModals();

        let photo = this.cachedPhotos.find(p => p.id === photoId);
        if (!photo) {
            this.cachedPhotos = await storage.getPhotos();
            photo = this.cachedPhotos.find(p => p.id === photoId);
        }
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
                    <div class="photo-img-wrapper">
                        <div class="img-loading-skeleton"></div>
                        <img data-src="${photo.imageUrl}" alt="${photo.title}"
                             onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 150%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22150%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>加载失败</text></svg>'">
                    </div>
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
                    <button class="btn-delete-photo" onclick="calendar.deletePhoto('${photo.id}', '${dateStr}', this.closest('.photo-detail-modal'))">🗑️ 删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.initLazyLoad(modal);
    }

    async deletePhoto(photoId, dateStr, modal) {
        if (confirm('确定要删除这张照片吗？')) {
            await storage.deletePhoto(photoId);
            this.cachedPhotos = this.cachedPhotos.filter(p => p.id !== photoId);
            if (modal) modal.remove();
            await this.showDatePhotos(dateStr, null);
            await this.updateCalendar();
        }
    }

    showUploadModal(dateStr) {
        this.clearTransientModals();
        
        const modal = document.createElement('div');
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="upload-content">
                <div class="upload-header">
                    <h3>📤 上传照片</h3>
                    <button onclick="this.closest('.upload-modal').remove()">✕</button>
                </div>
                <div class="upload-body">
                    <div class="upload-area" id="upload-area-${dateStr}">
                        <input type="file" id="file-input-${dateStr}" accept="image/jpeg,image/png,image/webp" style="display: none;">
                        <div class="upload-icon">📷</div>
                        <p>点击或拖拽照片到这里</p>
                        <p class="upload-hint">支持 JPG、PNG、WebP，最大 5MB</p>
                    </div>
                    <div class="upload-form">
                        <div class="uploader-select">
                            <label>上传者</label>
                            <div class="uploader-options">
                                <label class="uploader-option">
                                    <input type="radio" name="uploader-${dateStr}" value="jing" checked>
                                    <span class="uploader-label">❤️ 境</span>
                                </label>
                                <label class="uploader-option">
                                    <input type="radio" name="uploader-${dateStr}" value="yang">
                                    <span class="uploader-label">💛 扬</span>
                                </label>
                            </div>
                        </div>
                        <input type="text" id="photo-title-${dateStr}" class="upload-input" placeholder="照片标题（可选）">
                        <textarea id="photo-desc-${dateStr}" class="upload-textarea" placeholder="照片描述（可选）" rows="3"></textarea>
                    </div>
                    <div id="upload-preview-${dateStr}" class="upload-preview" style="display: none;">
                        <img id="preview-img-${dateStr}" src="" alt="预览">
                    </div>
                </div>
                <div class="upload-footer">
                    <button class="btn-cancel" onclick="this.closest('.upload-modal').remove()">取消</button>
                    <button class="btn-upload" id="btn-upload-${dateStr}" disabled>上传</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.setupUploadEvents(dateStr);
    }

    setupUploadEvents(dateStr) {
        const uploadArea = document.getElementById(`upload-area-${dateStr}`);
        const fileInput = document.getElementById(`file-input-${dateStr}`);
        const previewImg = document.getElementById(`preview-img-${dateStr}`);
        const uploadPreview = document.getElementById(`upload-preview-${dateStr}`);
        const uploadBtn = document.getElementById(`btn-upload-${dateStr}`);
        const titleInput = document.getElementById(`photo-title-${dateStr}`);
        const descInput = document.getElementById(`photo-desc-${dateStr}`);

        let selectedFile = null;

        const handleFileSelect = (file, dStr) => {
            try {
                console.log('选择文件:', file.name, '大小:', file.size, '类型:', file.type);
                ImageUtils.validateFile(file);
                selectedFile = file;

                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    uploadPreview.style.display = 'block';
                    uploadBtn.disabled = false;
                    console.log('文件预览加载成功');
                };
                reader.onerror = (e) => {
                    console.error('文件读取失败:', e);
                    alert('文件读取失败，请重试');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('文件验证失败:', error);
                alert(error.message);
            }
        };

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0], dateStr);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0], dateStr);
            }
        });

        uploadBtn.addEventListener('click', async () => {
            if (!selectedFile) {
                console.warn('没有选择文件');
                return;
            }

            try {
                uploadBtn.disabled = true;
                uploadBtn.textContent = '上传中...';

                console.log('开始上传, 文件信息:', {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                });

                const uploaderInput = document.querySelector(`input[name="uploader-${dateStr}"]:checked`);
                const uploader = uploaderInput ? uploaderInput.value : 'jing';

                await storage.uploadPhoto(
                    selectedFile,
                    dateStr,
                    titleInput.value,
                    descInput.value,
                    uploader
                );

                console.log('上传成功');
                this.cachedPhotos = await storage.getPhotos();
                document.querySelector('.upload-modal').remove();
                await this.showDatePhotos(dateStr, null);
                await this.updateCalendar();
            } catch (error) {
                console.error('上传失败:', error);
                alert('上传失败: ' + (error.message || '未知错误'));
                uploadBtn.disabled = false;
                uploadBtn.textContent = '上传';
            }
        });
    }

    initLazyLoad(container) {
        const images = container.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });

            images.forEach(img => observer.observe(img));
        } else {
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    preloadImage(url) {
        return new Promise((resolve, reject) => {
            if (!url) { resolve(null); return; }
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    async preloadDatePhotos(dateStr) {
        const photos = await storage.getPhotosByDate(dateStr);
        const urls = photos.map(p => p.thumbnailUrl).filter(Boolean);
        await Promise.all(urls.slice(0, 6).map(url => this.preloadImage(url)));
    }

    isSpecialDate(dateStr) {
        return CONFIG.specialDates.some(d => d.date === dateStr);
    }
}

const calendar = new CoupleCalendar();
