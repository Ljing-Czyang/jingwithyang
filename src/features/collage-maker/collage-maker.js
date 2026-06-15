class CollageMaker {
    constructor() {
        this.items = [];
        this.previewCanvas = null;
        this.latestBlob = null;
        this.maxCanvasPixels = 18000000;
        this.defaultSettings = {
            template: 'magazine',
            style: 'romantic',
            ratio: '4:5',
            fit: 'cover',
            background: '#fff7fb',
            gap: 24,
            radius: 28,
            outputWidth: 1800,
            format: 'image/jpeg',
            quality: 0.95,
            title: '',
            subtitle: '',
            saveToAlbum: false,
            uploader: 'jing'
        };
    }

    /**
     * 显示组图工具弹窗，创建完整的图片选择、排版配置、预览导出和相册保存界面。
     * @returns {void} 该方法不返回值，会直接向页面中插入组图工具弹窗。
     */
    show() {
        this.close();
        const modal = document.createElement('div');
        modal.className = 'collage-modal';
        modal.innerHTML = this.renderModal();
        document.body.appendChild(modal);
        this.previewCanvas = document.getElementById('collage-preview-canvas');
        this.bindEvents(modal);
        this.renderSelectedImages();
        this.renderPreview();
    }

    /**
     * 关闭当前组图工具弹窗，并释放本地图片预览地址以避免浏览器内存占用持续增加。
     * @returns {void} 该方法不返回值。
     */
    close() {
        document.querySelectorAll('.collage-modal').forEach(el => el.remove());
        this.items.forEach(item => URL.revokeObjectURL(item.url));
        this.items = [];
        this.latestBlob = null;
    }

    /**
     * 渲染组图工具弹窗 HTML，包含上传区域、参数面板、预览画布和导出操作区。
     * @returns {string} 返回可插入页面的弹窗 HTML 字符串。
     */
    renderModal() {
        return `
            <div class="collage-content">
                <div class="collage-header">
                    <div>
                        <h3>🧩 组图工具</h3>
                        <p>高清拼图，可下载，也可保存到私密相册</p>
                    </div>
                    <button onclick="collageMaker.close()">✕</button>
                </div>
                <div class="collage-body">
                    <div class="collage-panel">
                        <div class="collage-upload-area" id="collage-upload-area">
                            <input type="file" id="collage-file-input" accept="image/jpeg,image/png,image/webp" multiple>
                            <div class="collage-upload-icon">📷</div>
                            <strong>选择或拖拽多张照片</strong>
                            <span>支持 JPG、PNG、WebP，建议 2-12 张</span>
                        </div>
                        <div class="collage-selected" id="collage-selected"></div>
                        <div class="collage-controls">
                            ${this.renderSelect('collage-template', '排版模板', [
                                ['magazine', '杂志封面'],
                                ['moodboard', '错落拼贴'],
                                ['masonry', '瀑布流海报'],
                                ['polaroid', '胶片相纸'],
                                ['story', '故事长图'],
                                ['minimal', '极简留白']
                            ])}
                            ${this.renderSelect('collage-style', '视觉风格', [
                                ['romantic', '粉色浪漫'],
                                ['cream', '奶油相册'],
                                ['film', '暗色胶片'],
                                ['fresh', '清新蓝绿'],
                                ['minimal', '高级极简']
                            ])}
                            ${this.renderSelect('collage-ratio', '画布比例', [
                                ['1:1', '1:1 方图'],
                                ['4:5', '4:5 竖图'],
                                ['3:4', '3:4 经典'],
                                ['9:16', '9:16 手机屏'],
                                ['16:9', '16:9 横图']
                            ])}
                            ${this.renderSelect('collage-fit', '图片适配', [
                                ['cover', '铺满裁切'],
                                ['contain', '完整留白']
                            ])}
                            <label class="collage-field">
                                <span>背景颜色</span>
                                <input type="color" id="collage-background" value="${this.defaultSettings.background}">
                            </label>
                            <label class="collage-field">
                                <span>图片间距</span>
                                <input type="range" id="collage-gap" min="0" max="72" value="${this.defaultSettings.gap}">
                            </label>
                            <label class="collage-field">
                                <span>圆角大小</span>
                                <input type="range" id="collage-radius" min="0" max="80" value="${this.defaultSettings.radius}">
                            </label>
                            <label class="collage-field">
                                <span>导出宽度</span>
                                <select id="collage-output-width">
                                    <option value="1200">清晰 1200px</option>
                                    <option value="1800" selected>高清 1800px</option>
                                    <option value="2400">超清 2400px</option>
                                </select>
                            </label>
                            <label class="collage-field">
                                <span>导出格式</span>
                                <select id="collage-format">
                                    <option value="image/jpeg" selected>JPG 高质量</option>
                                    <option value="image/png">PNG 无损</option>
                                </select>
                            </label>
                            <label class="collage-field collage-field-full">
                                <span>标题</span>
                                <input type="text" id="collage-title" maxlength="30" placeholder="例如：我们的今日份回忆">
                            </label>
                            <label class="collage-field collage-field-full">
                                <span>说明</span>
                                <input type="text" id="collage-subtitle" maxlength="60" placeholder="可选，用一句话记录这组照片">
                            </label>
                            <label class="collage-check collage-field-full">
                                <input type="checkbox" id="collage-save-album">
                                <span>同时保存到私密相册</span>
                            </label>
                            <div class="collage-uploader collage-field-full" id="collage-uploader-row" style="display: none;">
                                <span>保存者</span>
                                <label><input type="radio" name="collage-uploader" value="jing" checked> 💚 境</label>
                                <label><input type="radio" name="collage-uploader" value="yang"> 💙 扬</label>
                            </div>
                        </div>
                    </div>
                    <div class="collage-preview-panel">
                        <div class="collage-preview-head">
                            <strong>高清预览</strong>
                            <span id="collage-size-tip">等待选择图片</span>
                        </div>
                        <div class="collage-preview-wrap">
                            <canvas id="collage-preview-canvas"></canvas>
                            <div class="collage-empty-preview" id="collage-empty-preview">选择照片后自动生成组图</div>
                        </div>
                    </div>
                </div>
                <div class="collage-footer">
                    <button class="collage-btn secondary" id="collage-clear-btn">清空</button>
                    <button class="collage-btn secondary" id="collage-share-btn">系统分享/保存</button>
                    <button class="collage-btn primary" id="collage-download-btn">下载高清组图</button>
                    <button class="collage-btn primary" id="collage-save-btn">生成并处理</button>
                </div>
            </div>
        `;
    }

    /**
     * 渲染带标题的下拉选择控件，减少弹窗模板中重复的表单 HTML。
     * @param {string} id 控件的 DOM id，用于后续读取用户选择。
     * @param {string} label 控件标题，用于向用户说明该配置项含义。
     * @param {Array<Array<string>>} options 下拉选项数组，每项包含选项值和展示文本。
     * @returns {string} 返回下拉控件 HTML 字符串。
     */
    renderSelect(id, label, options) {
        const optionHtml = options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('');
        return `
            <label class="collage-field">
                <span>${label}</span>
                <select id="${id}">${optionHtml}</select>
            </label>
        `;
    }

    /**
     * 绑定弹窗内的上传、拖拽、参数变更、导出、分享和保存事件。
     * @param {HTMLElement} modal 当前组图工具弹窗根节点。
     * @returns {void} 该方法不返回值。
     */
    bindEvents(modal) {
        const uploadArea = modal.querySelector('#collage-upload-area');
        const fileInput = modal.querySelector('#collage-file-input');
        const controls = modal.querySelector('.collage-controls');
        const saveAlbum = modal.querySelector('#collage-save-album');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', event => this.addFiles(Array.from(event.target.files || [])));
        uploadArea.addEventListener('dragover', event => {
            event.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', event => {
            event.preventDefault();
            uploadArea.classList.remove('dragover');
            this.addFiles(Array.from(event.dataTransfer.files || []));
        });
        controls.addEventListener('input', () => this.renderPreview());
        controls.addEventListener('change', event => {
            if (event.target === saveAlbum) {
                const uploaderRow = modal.querySelector('#collage-uploader-row');
                uploaderRow.style.display = saveAlbum.checked ? 'flex' : 'none';
            }
            this.renderPreview();
        });
        modal.querySelector('#collage-clear-btn').addEventListener('click', () => this.clearImages());
        modal.querySelector('#collage-download-btn').addEventListener('click', () => this.downloadCollage());
        modal.querySelector('#collage-share-btn').addEventListener('click', () => this.shareCollage());
        modal.querySelector('#collage-save-btn').addEventListener('click', () => this.generateAndHandleCollage());
    }

    /**
     * 将用户选择的图片文件加入组图列表，并为每张图片创建预览地址与尺寸信息。
     * @param {File[]} files 用户从文件选择器或拖拽区域传入的文件数组。
     * @returns {Promise<void>} 处理完成后刷新已选列表和画布预览。
     */
    async addFiles(files) {
        const imageFiles = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
        if (imageFiles.length !== files.length) {
            alert('已忽略非图片文件，只支持 JPG、PNG、WebP。');
        }

        const failedFiles = [];
        for (const file of imageFiles) {
            try {
                const item = await this.createImageItem(file);
                this.items.push(item);
            } catch (error) {
                failedFiles.push(file.name);
            }
        }

        if (failedFiles.length > 0) {
            alert(`以下图片加载失败，已跳过：${failedFiles.join('、')}`);
        }

        this.renderSelectedImages();
        await this.renderPreview();
    }

    /**
     * 从图片文件创建组图内部数据对象，包含唯一标识、原始文件、本地地址和原图尺寸。
     * @param {File} file 用户选择的图片文件。
     * @returns {Promise<Object>} 返回包含 id、file、url、width、height 的图片数据对象。
     */
    createImageItem(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                resolve({
                    id: `collage_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                    file,
                    url,
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(`图片加载失败：${file.name}`));
            };
            img.src = url;
        });
    }

    /**
     * 渲染已选择图片的缩略图列表，提供按单张移除的交互入口。
     * @returns {void} 该方法不返回值。
     */
    renderSelectedImages() {
        const selected = document.getElementById('collage-selected');
        if (!selected) return;

        if (this.items.length === 0) {
            selected.innerHTML = '<div class="collage-selected-empty">还没有选择图片</div>';
            return;
        }

        selected.innerHTML = this.items.map((item, index) => `
            <div class="collage-thumb">
                <img src="${item.url}" alt="第 ${index + 1} 张图片">
                <button onclick="collageMaker.removeImage('${item.id}')">✕</button>
            </div>
        `).join('');
    }

    /**
     * 从组图列表中移除指定图片，并释放该图片的本地预览地址。
     * @param {string} id 要移除图片的数据 id。
     * @returns {Promise<void>} 移除完成后刷新列表和组图预览。
     */
    async removeImage(id) {
        const item = this.items.find(photo => photo.id === id);
        if (item) URL.revokeObjectURL(item.url);
        this.items = this.items.filter(photo => photo.id !== id);
        this.renderSelectedImages();
        await this.renderPreview();
    }

    /**
     * 清空当前已选图片列表，并同步清理预览画布和缓存导出结果。
     * @returns {Promise<void>} 清空完成后刷新组图预览区域。
     */
    async clearImages() {
        this.items.forEach(item => URL.revokeObjectURL(item.url));
        this.items = [];
        this.latestBlob = null;
        this.renderSelectedImages();
        await this.renderPreview();
    }

    /**
     * 读取当前弹窗表单中的所有组图配置，转换为绘制逻辑需要的标准设置对象。
     * @returns {Object} 返回包含模板、比例、背景、间距、圆角、导出格式和保存选项的配置对象。
     */
    getSettings() {
        const uploaderInput = document.querySelector('input[name="collage-uploader"]:checked');
        return {
            template: document.getElementById('collage-template')?.value || this.defaultSettings.template,
            style: document.getElementById('collage-style')?.value || this.defaultSettings.style,
            ratio: document.getElementById('collage-ratio')?.value || this.defaultSettings.ratio,
            fit: document.getElementById('collage-fit')?.value || this.defaultSettings.fit,
            background: document.getElementById('collage-background')?.value || this.defaultSettings.background,
            gap: Number(document.getElementById('collage-gap')?.value || this.defaultSettings.gap),
            radius: Number(document.getElementById('collage-radius')?.value || this.defaultSettings.radius),
            outputWidth: Number(document.getElementById('collage-output-width')?.value || this.defaultSettings.outputWidth),
            format: document.getElementById('collage-format')?.value || this.defaultSettings.format,
            quality: this.defaultSettings.quality,
            title: document.getElementById('collage-title')?.value.trim() || '',
            subtitle: document.getElementById('collage-subtitle')?.value.trim() || '',
            saveToAlbum: Boolean(document.getElementById('collage-save-album')?.checked),
            uploader: uploaderInput ? uploaderInput.value : this.defaultSettings.uploader
        };
    }

    /**
     * 根据画布比例字符串计算导出画布尺寸，并限制总像素量以平衡清晰度和移动端稳定性。
     * @param {Object} settings 当前组图设置对象。
     * @returns {{width: number, height: number}} 返回最终导出画布的宽高像素。
     */
    getCanvasSize(settings) {
        const [ratioWidth, ratioHeight] = settings.ratio.split(':').map(Number);
        let width = settings.outputWidth;
        let height = Math.round(width * ratioHeight / ratioWidth);

        if (settings.template === 'story') {
            const rows = Math.max(1, this.items.length);
            height = Math.max(height, Math.round(width * (0.62 + rows * 0.52)));
        }

        if (settings.template === 'masonry') {
            const rows = Math.max(2, Math.ceil(this.items.length / 2));
            height = Math.max(height, Math.round(width * (0.7 + rows * 0.34)));
        }

        const pixels = width * height;
        if (pixels > this.maxCanvasPixels) {
            const ratio = Math.sqrt(this.maxCanvasPixels / pixels);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        return { width, height };
    }

    /**
     * 生成高级版式图层，按模板返回带角色、相框、旋转和层级的绘制描述。
     * @param {number} width 画布宽度，单位为像素。
     * @param {number} height 画布高度，单位为像素。
     * @param {Object} settings 当前组图设置对象。
     * @returns {Array<Object>} 返回每张图片对应的高级绘制图层数组。
     */
    getLayoutRects(width, height, settings) {
        const count = this.items.length;
        if (count === 0) return [];

        const padding = Math.round(width * 0.06);
        const titleSpace = settings.title || settings.subtitle ? Math.round(width * 0.15) : Math.round(width * 0.035);
        const area = {
            x: padding,
            y: padding + titleSpace,
            width: width - padding * 2,
            height: height - padding * 1.35 - titleSpace
        };
        const gap = settings.gap;

        if (settings.template === 'magazine') return this.getMagazineRects(area, gap, count);
        if (settings.template === 'moodboard') return this.getMoodboardRects(area, gap, count);
        if (settings.template === 'masonry') return this.getMasonryRects(area, gap, count);
        if (settings.template === 'polaroid') return this.getPolaroidRects(area, gap, count);
        if (settings.template === 'story') return this.getStoryRects(area, gap, count);
        if (settings.template === 'minimal') return this.getMinimalRects(area, gap, count);
        return this.getMagazineRects(area, gap, count);
    }

    /**
     * 生成杂志封面布局，第一张图片占据主视觉，其余图片以副卡片方式排列在侧边或底部。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回杂志封面图层数组。
     */
    getMagazineRects(area, gap, count) {
        if (count === 1) return [{ ...area, role: 'hero', frame: 'clean', rotation: 0, z: 1 }];

        const heroHeight = Math.round(area.height * 0.62);
        const rects = [{
            x: area.x,
            y: area.y,
            width: area.width,
            height: heroHeight,
            role: 'hero',
            frame: 'clean',
            rotation: 0,
            z: 1
        }];
        const rest = count - 1;
        const columns = Math.min(3, rest);
        const rows = Math.ceil(rest / columns);
        const smallWidth = (area.width - gap * (columns - 1)) / columns;
        const smallHeight = (area.height - heroHeight - gap - gap * (rows - 1)) / rows;

        for (let i = 0; i < rest; i++) {
            const column = i % columns;
            const row = Math.floor(i / columns);
            rects.push({
                x: area.x + column * (smallWidth + gap),
                y: area.y + heroHeight + gap + row * (smallHeight + gap),
                width: smallWidth,
                height: smallHeight,
                role: 'support',
                frame: 'clean',
                rotation: 0,
                z: 2
            });
        }

        return rects;
    }

    /**
     * 生成错落拼贴布局，图片以不同尺寸、角度和层级叠放，形成手账式视觉效果。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的参考间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回错落拼贴图层数组。
     */
    getMoodboardRects(area, gap, count) {
        const presets = [
            [0.04, 0.02, 0.58, 0.42, -4, 2],
            [0.48, 0.08, 0.46, 0.34, 5, 3],
            [0.08, 0.44, 0.42, 0.31, 3, 4],
            [0.53, 0.43, 0.39, 0.38, -3, 5],
            [0.19, 0.74, 0.34, 0.24, -6, 6],
            [0.58, 0.76, 0.32, 0.22, 4, 7],
            [0.00, 0.75, 0.25, 0.20, 6, 8],
            [0.74, 0.00, 0.24, 0.22, -5, 9]
        ];
        return Array.from({ length: count }, (_, index) => {
            const preset = presets[index % presets.length];
            return {
                x: area.x + area.width * preset[0] + (index >= presets.length ? gap * 0.4 : 0),
                y: area.y + area.height * preset[1] + (index >= presets.length ? gap * 0.4 : 0),
                width: area.width * preset[2],
                height: area.height * preset[3],
                role: index === 0 ? 'hero' : 'support',
                frame: 'paper',
                rotation: preset[4],
                z: preset[5]
            };
        });
    }

    /**
     * 生成瀑布流布局，根据原图宽高比例动态计算每张图片高度，避免强行裁成等高网格。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回瀑布流图层数组。
     */
    getMasonryRects(area, gap, count) {
        const columns = count <= 3 ? 1 : 2;
        const columnWidth = (area.width - gap * (columns - 1)) / columns;
        const columnHeights = Array(columns).fill(area.y);
        return Array.from({ length: count }, (_, index) => {
            const item = this.items[index];
            const ratio = item && item.height ? item.height / item.width : 1;
            const column = columnHeights.indexOf(Math.min(...columnHeights));
            const imageHeight = Math.min(columnWidth * 1.45, Math.max(columnWidth * 0.72, columnWidth * ratio));
            const rect = {
                x: area.x + column * (columnWidth + gap),
                y: columnHeights[column],
                width: columnWidth,
                height: imageHeight,
                role: 'support',
                frame: 'clean',
                rotation: 0,
                z: index + 1
            };
            columnHeights[column] += imageHeight + gap;
            return rect;
        });
    }

    /**
     * 生成胶片相纸布局，所有图片以带白边相纸卡片排列，并保留底部标题空间。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回胶片相纸图层数组。
     */
    getPolaroidRects(area, gap, count) {
        const columns = count <= 2 ? count : 2;
        const rows = Math.ceil(count / columns);
        const cellWidth = (area.width - gap * (columns - 1)) / columns;
        const cellHeight = (area.height - gap * (rows - 1)) / rows;
        return Array.from({ length: count }, (_, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            return {
                x: area.x + column * (cellWidth + gap),
                y: area.y + row * (cellHeight + gap),
                width: cellWidth,
                height: cellHeight,
                role: 'support',
                frame: 'polaroid',
                rotation: [-3, 2, -1, 3, -2, 1][index % 6],
                z: index + 1
            };
        });
    }

    /**
     * 生成故事长图布局，每张图片作为纵向时间线卡片展示，适合连续记录一组回忆。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回故事长图图层数组。
     */
    getStoryRects(area, gap, count) {
        const cardHeight = Math.max(area.width * 0.5, (area.height - gap * (count - 1)) / count);
        return Array.from({ length: count }, (_, index) => ({
            x: area.x + (index % 2 === 0 ? 0 : area.width * 0.08),
            y: area.y + index * (cardHeight + gap),
            width: area.width * (index % 2 === 0 ? 0.92 : 0.88),
            height: cardHeight,
            role: index === 0 ? 'hero' : 'support',
            frame: 'story',
            rotation: 0,
            z: index + 1
        }));
    }

    /**
     * 生成极简留白布局，用大量空白和小尺寸阵列营造更高级、克制的视觉效果。
     * @param {Object} area 可用内容区域，包含 x、y、width、height。
     * @param {number} gap 图片之间的间距。
     * @param {number} count 图片数量。
     * @returns {Array<Object>} 返回极简留白图层数组。
     */
    getMinimalRects(area, gap, count) {
        if (count === 1) {
            return [{ x: area.x + area.width * 0.12, y: area.y + area.height * 0.16, width: area.width * 0.76, height: area.height * 0.58, role: 'hero', frame: 'clean', rotation: 0, z: 1 }];
        }

        const columns = Math.min(3, count);
        const rows = Math.ceil(count / columns);
        const gridWidth = area.width * 0.78;
        const gridHeight = area.height * 0.68;
        const startX = area.x + (area.width - gridWidth) / 2;
        const startY = area.y + (area.height - gridHeight) / 2;
        const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
        const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
        return Array.from({ length: count }, (_, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            return {
                x: startX + column * (cellWidth + gap),
                y: startY + row * (cellHeight + gap),
                width: cellWidth,
                height: cellHeight,
                role: 'support',
                frame: 'clean',
                rotation: 0,
                z: index + 1
            };
        });
    }

    /**
     * 将当前图片和设置绘制到指定画布上，并在需要时同步更新导出尺寸提示。
     * @param {HTMLCanvasElement} canvas 用于承载组图结果的画布元素。
     * @param {Object} settings 当前组图设置对象。
     * @returns {Promise<HTMLCanvasElement>} 返回已完成绘制的画布元素。
     */
    async drawToCanvas(canvas, settings) {
        const size = this.getCanvasSize(settings);
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        this.drawBackground(ctx, size.width, size.height, settings);
        this.drawDecorations(ctx, size.width, size.height, settings);

        this.drawText(ctx, size.width, settings);
        const rects = this.getLayoutRects(size.width, size.height, settings).sort((a, b) => a.z - b.z);
        for (let index = 0; index < rects.length; index++) {
            const rect = rects[index];
            const image = await this.loadImage(this.items[index].url);
            this.drawImageInRect(ctx, image, rect, settings, index);
        }
        this.drawFooterMark(ctx, size.width, size.height, settings);

        const sizeTip = document.getElementById('collage-size-tip');
        if (sizeTip) sizeTip.textContent = `${size.width} × ${size.height}px · ${this.items.length} 张`;
        return canvas;
    }

    /**
     * 根据用户选择的视觉风格绘制画布背景，支持纯色、渐变和胶片暗色背景。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {number} width 当前画布宽度。
     * @param {number} height 当前画布高度。
     * @param {Object} settings 当前组图设置对象，包含 style 和 background。
     * @returns {void} 该方法不返回值。
     */
    drawBackground(ctx, width, height, settings) {
        const palettes = this.getStylePalette(settings);
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, palettes.backgroundStart);
        gradient.addColorStop(1, palettes.backgroundEnd);
        ctx.fillStyle = settings.style === 'minimal' ? settings.background : gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * 绘制背景装饰元素，例如柔和光斑、色块和胶片颗粒感，让组图不再只是平铺照片。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {number} width 当前画布宽度。
     * @param {number} height 当前画布高度。
     * @param {Object} settings 当前组图设置对象，包含视觉风格。
     * @returns {void} 该方法不返回值。
     */
    drawDecorations(ctx, width, height, settings) {
        const palette = this.getStylePalette(settings);
        ctx.save();
        ctx.globalAlpha = settings.style === 'film' ? 0.18 : 0.32;
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(width * 0.88, height * 0.12, width * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        ctx.arc(width * 0.12, height * 0.86, width * 0.24, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = settings.style === 'film' ? 0.16 : 0.08;
        for (let i = 0; i < 80; i++) {
            const x = (i * 97 % 1000) / 1000 * width;
            const y = (i * 53 % 1000) / 1000 * height;
            ctx.fillRect(x, y, 1.6, 1.6);
        }
        ctx.restore();
    }

    /**
     * 在画布顶部绘制标题和说明文字，为组图增加可选的纪念文案。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {number} width 当前画布宽度。
     * @param {Object} settings 当前组图设置对象，包含 title、subtitle 和 style。
     * @returns {void} 该方法不返回值。
     */
    drawText(ctx, width, settings) {
        if (!settings.title && !settings.subtitle) return;

        const palette = this.getStylePalette(settings);
        const padding = Math.round(width * 0.06);
        ctx.fillStyle = palette.text;
        ctx.textBaseline = 'top';
        if (settings.title) {
            ctx.font = `800 ${Math.round(width * 0.043)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillText(settings.title, padding, padding);
        }
        if (settings.subtitle) {
            ctx.fillStyle = palette.muted;
            ctx.font = `400 ${Math.round(width * 0.024)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillText(settings.subtitle, padding, padding + Math.round(width * 0.064));
        }
    }

    /**
     * 将单张图片按高级图层描述绘制进目标区域，支持阴影、旋转、白边相框和故事标签。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {HTMLImageElement} image 已加载完成的图片元素。
     * @param {Object} rect 图片目标区域，包含 x、y、width、height、frame、rotation。
     * @param {Object} settings 当前组图设置对象，包含 fit、radius 和 style。
     * @param {number} index 当前绘制图片在组图中的序号。
     * @returns {void} 该方法不返回值。
     */
    drawImageInRect(ctx, image, rect, settings, index = 0) {
        const palette = this.getStylePalette(settings);
        const framePadding = rect.frame === 'polaroid' ? Math.round(rect.width * 0.055) : rect.frame === 'paper' ? Math.round(rect.width * 0.035) : 0;
        const captionHeight = rect.frame === 'polaroid' ? Math.round(rect.height * 0.14) : rect.frame === 'story' ? Math.round(rect.height * 0.16) : 0;
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const angle = (rect.rotation || 0) * Math.PI / 180;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);
        ctx.shadowColor = settings.style === 'film' ? 'rgba(0,0,0,0.45)' : 'rgba(45,52,54,0.22)';
        ctx.shadowBlur = rect.role === 'hero' ? 34 : 20;
        ctx.shadowOffsetY = rect.role === 'hero' ? 18 : 10;
        ctx.fillStyle = rect.frame === 'clean' ? palette.card : '#ffffff';
        this.roundRect(ctx, rect.x, rect.y, rect.width, rect.height, Math.min(settings.radius, 42));
        ctx.fill();
        ctx.shadowColor = 'transparent';

        const imageRect = {
            x: rect.x + framePadding,
            y: rect.y + framePadding,
            width: rect.width - framePadding * 2,
            height: rect.height - framePadding * 2 - captionHeight
        };
        const radius = Math.min(settings.radius, imageRect.width / 2, imageRect.height / 2);
        ctx.save();
        this.roundRect(ctx, imageRect.x, imageRect.y, imageRect.width, imageRect.height, radius);
        ctx.clip();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);

        const scale = settings.fit === 'contain'
            ? Math.min(imageRect.width / image.naturalWidth, imageRect.height / image.naturalHeight)
            : Math.max(imageRect.width / image.naturalWidth, imageRect.height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const drawX = imageRect.x + (imageRect.width - drawWidth) / 2;
        const drawY = imageRect.y + (imageRect.height - drawHeight) / 2;
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        if (captionHeight > 0) {
            this.drawImageCaption(ctx, rect, palette, index);
        }
        ctx.restore();
    }

    /**
     * 绘制相纸或故事卡片底部的编号文案，强化照片组的叙事感。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {Object} rect 图片目标区域，包含位置和尺寸。
     * @param {Object} palette 当前视觉风格配色对象。
     * @param {number} index 当前图片序号。
     * @returns {void} 该方法不返回值。
     */
    drawImageCaption(ctx, rect, palette, index) {
        ctx.fillStyle = palette.muted;
        ctx.textBaseline = 'middle';
        ctx.font = `500 ${Math.round(rect.width * 0.055)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillText(`Memory ${String(index + 1).padStart(2, '0')}`, rect.x + rect.width * 0.08, rect.y + rect.height * 0.92);
    }

    /**
     * 在画布底部绘制轻量落款，让导出的组图更像完整作品而不是裸图拼接。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {number} width 当前画布宽度。
     * @param {number} height 当前画布高度。
     * @param {Object} settings 当前组图设置对象。
     * @returns {void} 该方法不返回值。
     */
    drawFooterMark(ctx, width, height, settings) {
        const palette = this.getStylePalette(settings);
        ctx.save();
        ctx.fillStyle = palette.muted;
        ctx.globalAlpha = 0.68;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = `500 ${Math.round(width * 0.018)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillText('Our Memory · Collage', width / 2, height - width * 0.028);
        ctx.restore();
    }

    /**
     * 根据视觉风格返回绘制所需的背景、文字、卡片和强调色配置。
     * @param {Object} settings 当前组图设置对象，包含 style 和 background。
     * @returns {Object} 返回 backgroundStart、backgroundEnd、card、text、muted、accent 等颜色配置。
     */
    getStylePalette(settings) {
        const palettes = {
            romantic: { backgroundStart: '#fff0f6', backgroundEnd: '#f6f0ff', card: '#ffffff', text: '#2d3436', muted: '#8e6f80', accent: '#ff8fab' },
            cream: { backgroundStart: '#fff8e8', backgroundEnd: '#f5ead7', card: '#fffdf7', text: '#3d352c', muted: '#9a7b56', accent: '#e9c46a' },
            film: { backgroundStart: '#151515', backgroundEnd: '#34302c', card: '#f8f1e8', text: '#f8f1e8', muted: '#c8b8a7', accent: '#d4a373' },
            fresh: { backgroundStart: '#e9fbf7', backgroundEnd: '#eaf2ff', card: '#ffffff', text: '#24413d', muted: '#5f8a83', accent: '#6dd5c5' },
            minimal: { backgroundStart: settings.background, backgroundEnd: settings.background, card: '#ffffff', text: '#202020', muted: '#777777', accent: '#d8d8d8' }
        };
        return palettes[settings.style] || palettes.romantic;
    }

    /**
     * 在画布路径中创建圆角矩形，用于后续裁剪图片或绘制背景。
     * @param {CanvasRenderingContext2D} ctx 画布 2D 绘制上下文。
     * @param {number} x 矩形左上角横坐标。
     * @param {number} y 矩形左上角纵坐标。
     * @param {number} width 矩形宽度。
     * @param {number} height 矩形高度。
     * @param {number} radius 圆角半径。
     * @returns {void} 该方法不返回值。
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 加载指定地址的图片并返回图片元素，供 Canvas 高清绘制使用。
     * @param {string} src 图片地址，可以是本地 objectURL 或远程 URL。
     * @returns {Promise<HTMLImageElement>} 返回加载完成的图片元素。
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('组图图片加载失败'));
            image.src = src;
        });
    }

    /**
     * 刷新预览画布，根据当前图片和设置实时生成高清组图预览。
     * @returns {Promise<void>} 预览绘制完成后不返回值。
     */
    async renderPreview() {
        const empty = document.getElementById('collage-empty-preview');
        const sizeTip = document.getElementById('collage-size-tip');
        if (!this.previewCanvas) return;

        if (this.items.length === 0) {
            const ctx = this.previewCanvas.getContext('2d');
            this.previewCanvas.width = 1;
            this.previewCanvas.height = 1;
            ctx.clearRect(0, 0, 1, 1);
            if (empty) empty.style.display = 'flex';
            if (sizeTip) sizeTip.textContent = '等待选择图片';
            return;
        }

        if (empty) empty.style.display = 'none';
        await this.drawToCanvas(this.previewCanvas, this.getSettings());
    }

    /**
     * 将当前画布按用户选择的格式和质量导出为 Blob，用于下载、分享或保存到相册。
     * @returns {Promise<Blob>} 返回导出的图片 Blob 数据。
     */
    async exportBlob() {
        if (this.items.length === 0) {
            throw new Error('请先选择要组图的照片');
        }

        const settings = this.getSettings();
        const canvas = document.createElement('canvas');
        await this.drawToCanvas(canvas, settings);
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('组图导出失败，请重试'));
                    return;
                }
                this.latestBlob = blob;
                resolve(blob);
            }, settings.format, settings.format === 'image/jpeg' ? settings.quality : undefined);
        });
    }

    /**
     * 下载当前组图到本机文件，优先使用系统文件保存能力，普通下载会延迟释放 Blob 地址避免文件损坏。
     * @returns {Promise<void>} 下载触发或文件保存完成后不返回值。
     */
    async downloadCollage() {
        try {
            const blob = await this.exportBlob();
            const settings = this.getSettings();
            const fileName = this.getExportFileName(settings);

            if (window.showSaveFilePicker) {
                await this.saveBlobWithFilePicker(blob, fileName, settings.format);
                return;
            }

            this.downloadBlobWithAnchor(blob, fileName);
        } catch (error) {
            if (error.name === 'AbortError') return;
            alert(error.message || '下载失败，请重试');
        }
    }

    /**
     * 根据导出格式生成安全的图片文件名，避免特殊字符触发系统下载或安全策略异常。
     * @param {Object} settings 当前组图设置对象，包含导出格式。
     * @returns {string} 返回只包含英文、数字和连字符的文件名。
     */
    getExportFileName(settings) {
        const ext = settings.format === 'image/png' ? 'png' : 'jpg';
        const time = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        return `our-memory-collage-${time}.${ext}`;
    }

    /**
     * 使用浏览器文件系统保存能力写入图片文件，适用于新版 Edge/Chrome，可降低下载文件被拦截或损坏的概率。
     * @param {Blob} blob 需要保存的图片 Blob 数据。
     * @param {string} fileName 默认保存文件名。
     * @param {string} mimeType 图片 MIME 类型，例如 image/jpeg 或 image/png。
     * @returns {Promise<void>} 文件写入完成后不返回值。
     */
    async saveBlobWithFilePicker(blob, fileName, mimeType) {
        const ext = mimeType === 'image/png' ? '.png' : '.jpg';
        const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
                description: mimeType === 'image/png' ? 'PNG 图片' : 'JPG 图片',
                accept: { [mimeType]: [ext] }
            }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    /**
     * 使用传统 a 标签触发下载，并延迟释放 Blob 地址，避免 Windows 浏览器尚未完成写入时文件地址已失效。
     * @param {Blob} blob 需要下载的图片 Blob 数据。
     * @param {string} fileName 下载文件名。
     * @returns {void} 该方法不返回值。
     */
    downloadBlobWithAnchor(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.rel = 'noopener';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        window.setTimeout(() => {
            link.remove();
            URL.revokeObjectURL(url);
        }, 60000);
    }

    /**
     * 调用系统分享能力分享当前组图，支持的移动端可直接进入系统保存或分享面板。
     * @returns {Promise<void>} 分享面板关闭后不返回值。
     */
    async shareCollage() {
        try {
            const blob = await this.exportBlob();
            const settings = this.getSettings();
            const file = new File([blob], this.getExportFileName(settings), { type: settings.format });

            if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
                await navigator.share({ files: [file], title: '我们的组图' });
                return;
            }

            await this.downloadCollage();
            alert('当前浏览器不支持系统分享，已改为下载高清组图。');
        } catch (error) {
            alert(error.message || '分享失败，请重试');
        }
    }

    /**
     * 按当前配置生成组图，并根据用户选择决定是否额外保存到私密相册。
     * @returns {Promise<void>} 处理完成后通过提示告知用户结果。
     */
    async generateAndHandleCollage() {
        const saveBtn = document.getElementById('collage-save-btn');
        try {
            saveBtn.disabled = true;
            saveBtn.textContent = '处理中...';
            const blob = await this.exportBlob();
            const settings = this.getSettings();

            if (settings.saveToAlbum) {
                await this.saveToAlbum(blob, settings);
                alert('高清组图已生成，并保存到私密相册。');
                return;
            }

            await this.downloadCollage();
            alert('高清组图已生成，可在下载记录中查看。');
        } catch (error) {
            alert(error.message || '组图处理失败，请重试');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = '生成并处理';
        }
    }

    /**
     * 将导出的组图 Blob 转为 File，并复用现有相册存储流程保存成一张新的私密相册照片。
     * @param {Blob} blob 已导出的高清组图图片数据。
     * @param {Object} settings 当前组图设置对象，包含格式、标题、说明和上传者。
     * @returns {Promise<void>} 保存完成后刷新相册缓存，不返回值。
     */
    async saveToAlbum(blob, settings) {
        const ext = settings.format === 'image/png' ? 'png' : 'jpg';
        const file = new File([blob], `our-collage-${Date.now()}.${ext}`, { type: settings.format });
        const title = settings.title || '高清组图';
        const description = settings.subtitle || `由 ${this.items.length} 张照片生成`;
        const today = formatDate(new Date());

        await storage.uploadPhoto(file, today, title, description, settings.uploader, {
            maxSize: 20 * 1024 * 1024,
            skipValidation: false
        });

        if (typeof albumFeature !== 'undefined') {
            await albumFeature.refresh();
        }
    }
}

const collageMaker = new CollageMaker();
