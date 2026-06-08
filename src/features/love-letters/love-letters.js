class LoveLetters {
    constructor() {
        this.modal = null;
        this.currentBook = null;
        this.currentPageIndex = 0;
        this.isFlipping = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.boundEvents = null;
        this.lettersData = null;
        this.supabase = null;
        this.editingLetterId = null;
        this.editedPageIndex = 0;
        this.initSupabase();
        this.prefetch();
    }

    prefetch() {
        const cached = DataUtils.loadCachedValue('loveLetters_cache', null);
        if (cached) {
            this.lettersData = cached;
        }
        if (this.supabase) {
            this.loadLettersData(true).then(() => {
                this.renderBookCovers();
            });
        }
    }

    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
        } catch (error) {
            console.error('LoveLetters: 初始化 Supabase 失败:', error);
        }
    }

    async loadLettersData(forceRefresh) {
        this.lettersData = await DataUtils.loadRemoteValue({
            currentData: this.lettersData,
            forceRefresh: forceRefresh,
            supabase: this.supabase,
            cacheKey: 'loveLetters_cache',
            fallbackData: LETTERS_DATA || { books: [] },
            logLabel: 'LoveLetters',
            fetcher: async () => {
                const [booksResult, lettersResult] = await Promise.all([
                    this.supabase
                        .from(CONFIG.supabase.letterBooksTable)
                        .select('*')
                        .order('created_at', { ascending: true }),
                    this.supabase
                        .from(CONFIG.supabase.lettersTable)
                        .select('*')
                        .order('sort_order', { ascending: true })
                ]);

                if (booksResult.error) throw booksResult.error;
                if (lettersResult.error) throw lettersResult.error;

                return {
                    books: booksResult.data.map(book => ({
                        id: book.id,
                        title: book.title,
                        subtitle: book.subtitle,
                        color: book.color,
                        bgColor: book.bg_color,
                        coverIcon: book.cover_icon,
                        letters: lettersResult.data
                            .filter(letter => letter.book_id === book.id)
                            .map(letter => ({
                                id: letter.id,
                                date: letter.date,
                                content: letter.content
                            }))
                    }))
                };
            }
        });
        return this.lettersData;
    }

    async show() {
        if (this.modal) {
            this.close();
        }

        this.lettersData = this.lettersData || DataUtils.loadCachedValue('loveLetters_cache', null) || LETTERS_DATA || { books: [] };
        this.editingLetterId = null;

        this.modal = document.createElement('div');
        this.modal.className = 'love-letters-modal';
        this.modal.innerHTML = `
            <div class="love-letters-container">
                <div class="love-letters-header">
                    <h3>💌 我们的信</h3>
                    <button class="love-letters-close" onclick="loveLetters.close()">✕</button>
                </div>

                <div class="book-selection-view" id="bookSelectionView">
                    <p class="book-selection-title">选择一本信笺，开启我们的故事</p>
                    <div class="books-grid" id="booksGrid"></div>
                    <button class="write-letter-btn" id="writeLetterBtn">✍️ 写一封新信</button>
                </div>

                <div class="book-reading-view" id="bookReadingView">
                    <button class="book-back-btn" id="backToBooksBtn">← 返回书架</button>
                    <div class="book-reading-container">
                        <div class="book-pages-wrapper" id="pagesWrapper"></div>
                        <span class="touch-hint">← 左右滑动翻页 →</span>
                        <div class="page-indicator" id="pageIndicator"></div>
                        <div class="book-navigation">
                            <button class="nav-btn" id="prevPageBtn">◀ 上一页</button>
                            <button class="nav-btn" id="nextPageBtn">下一页 ▶</button>
                        </div>
                    </div>
                </div>

                <div class="write-letter-view" id="writeLetterView">
                    <button class="book-back-btn" id="backFromWriteBtn">← 返回书架</button>
                    <div class="write-letter-form">
                        <h4 class="write-letter-title" id="writeLetterTitle">✍️ 写一封新信</h4>
                        <div class="write-form-group">
                            <label>写给谁</label>
                            <div class="book-select-group" id="bookSelectGroup">
                                <div class="book-select-item selected" data-book-id="jing" onclick="loveLetters.selectBook('jing')">
                                    <span>🌿</span> 春日来信
                                </div>
                                <div class="book-select-item" data-book-id="yang" onclick="loveLetters.selectBook('yang')">
                                    <span>🌙</span> 星空寄语
                                </div>
                            </div>
                        </div>
                        <div class="write-form-group">
                            <label for="letterDate">日期</label>
                            <input type="text" id="letterDate" class="write-input" placeholder="如：2026.05.20" />
                        </div>
                        <div class="write-form-group">
                            <label for="letterTitle">标题 <span class="optional">(可选)</span></label>
                            <input type="text" id="letterTitle" class="write-input" placeholder="信件标题" />
                        </div>
                        <div class="write-form-group flex-1">
                            <label for="letterContent">正文</label>
                            <textarea id="letterContent" class="write-textarea" placeholder="写下你想说的话..."></textarea>
                        </div>
                        <div class="write-form-group">
                            <label for="letterSign">署名</label>
                            <input type="text" id="letterSign" class="write-input" placeholder="如：正扬" />
                        </div>
                        <div class="write-form-group">
                            <label for="letterLocation">地点 <span class="optional">(可选)</span></label>
                            <input type="text" id="letterLocation" class="write-input" placeholder="如：华师附小" />
                        </div>
                        <button class="submit-letter-btn" id="submitLetterBtn">寄出这封信 💌</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.renderBookCovers();
        this.bindEvents();

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        if (!this.lettersData || this.lettersData.books.length === 0) {
            this.loadLettersData(true).then(() => {
                this.renderBookCovers();
            });
        }
    }

    renderBookCovers() {
        const grid = document.getElementById('booksGrid');
        if (!grid || !this.lettersData || !this.lettersData.books) return;

        grid.innerHTML = this.lettersData.books.map(book => `
            <div class="book-cover-item ${book.id === 'jing' ? 'green-book' : 'blue-book'}"
                 data-book-id="${book.id}"
                 onclick="loveLetters.openBook('${book.id}')">
                <div class="book-cover-content">
                    <div class="book-cover-icon">${book.coverIcon}</div>
                    <div class="book-cover-title">${book.title}</div>
                    <div class="book-cover-subtitle">${book.subtitle}</div>
                    <div class="book-letter-count">${book.letters.length} 封信</div>
                    <div class="book-decoration"></div>
                </div>
            </div>
        `).join('');
    }

    selectBook(bookId) {
        document.querySelectorAll('.book-select-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.bookId === bookId);
        });
    }

    showWriteView() {
        this.editingLetterId = null;

        const selectionView = document.getElementById('bookSelectionView');
        const writeView = document.getElementById('writeLetterView');
        const backBtn = document.getElementById('backFromWriteBtn');
        const titleEl = document.getElementById('writeLetterTitle');
        const submitBtn = document.getElementById('submitLetterBtn');

        if (selectionView && writeView) {
            selectionView.style.display = 'none';
            writeView.classList.add('active');
        }

        if (titleEl) titleEl.textContent = '✍️ 写一封新信';
        if (submitBtn) {
            submitBtn.textContent = '寄出这封信 💌';
            submitBtn.style.background = '';
        }
        if (backBtn) backBtn.textContent = '← 返回书架';

        const today = new Date();
        const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
        const dateInput = document.getElementById('letterDate');
        const titleInput = document.getElementById('letterTitle');
        const contentInput = document.getElementById('letterContent');

        if (dateInput) dateInput.value = dateStr;
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';

        const signInput = document.getElementById('letterSign');
        if (signInput) signInput.value = '';

        const locationInput = document.getElementById('letterLocation');
        if (locationInput) locationInput.value = '';

        this.renderBookSelectItems();
    }

    showEditView(pageIndex) {
        if (!this.currentBook || !this.currentBook.letters[pageIndex]) return;

        const letter = this.currentBook.letters[pageIndex];

        if (!letter.id) {
            alert('这封信没有唯一标识，无法编辑（可能是本地数据）');
            return;
        }

        this.editingLetterId = letter.id;
        this.editedPageIndex = pageIndex;

        const readingView = document.getElementById('bookReadingView');
        const writeView = document.getElementById('writeLetterView');
        const backBtn = document.getElementById('backFromWriteBtn');
        const titleEl = document.getElementById('writeLetterTitle');
        const submitBtn = document.getElementById('submitLetterBtn');

        if (readingView && writeView) {
            readingView.classList.remove('active');
            writeView.classList.add('active');
        }

        if (titleEl) titleEl.textContent = '✏️ 编辑信件';
        if (submitBtn) {
            submitBtn.textContent = '保存修改 💾';
            submitBtn.style.background = '';
        }
        if (backBtn) backBtn.textContent = '← 返回阅读';

        const dateInput = document.getElementById('letterDate');
        const titleInput = document.getElementById('letterTitle');
        const contentInput = document.getElementById('letterContent');

        const htmlContent = letter.content || '';

        const titleMatch = htmlContent.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
        const titleText = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        let bodyHtml = htmlContent.replace(/<h4[^>]*>[\s\S]*?<\/h4>\s*/i, '');

        const divSignMatch = bodyHtml.match(/<div class="letter-signature"[^>]*>([\s\S]*?)<\/div>\s*$/i);
        const inlineSignMatch = bodyHtml.match(/(<p\s+style="text-align:\s*right;?"[^>]*>[\s\S]*?<\/p>\s*<p\s+style="text-align:\s*right;?[^"]*color:\s*#999[^"]*"[^>]*>[\s\S]*?<\/p>)\s*$/i);

        let signText = '';
        let locationText = '';
        let cleanBodyHtml = bodyHtml;

        if (divSignMatch) {
            cleanBodyHtml = bodyHtml.replace(/<div class="letter-signature"[^>]*>[\s\S]*?<\/div>\s*$/, '');
            const ps = divSignMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
            if (ps && ps[0]) signText = ps[0].replace(/<[^>]+>/g, '').trim();
            if (ps && ps[1]) {
                const dateLocText = ps[1].replace(/<[^>]+>/g, '').trim();
                const parts = dateLocText.split('·');
                if (parts.length > 1) locationText = parts.slice(1).join('·').trim();
            }
        } else if (inlineSignMatch) {
            cleanBodyHtml = bodyHtml.replace(/(<p\s+style="text-align:\s*right;?"[^>]*>[\s\S]*?<\/p>\s*<p\s+style="text-align:\s*right;?[^"]*color:\s*#999[^"]*"[^>]*>[\s\S]*?<\/p>)\s*$/, '');
            const ps = inlineSignMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
            if (ps && ps[0]) signText = ps[0].replace(/<[^>]+>/g, '').trim();
            if (ps && ps[1]) {
                const dateLocText = ps[1].replace(/<[^>]+>/g, '').trim();
                const parts = dateLocText.split('·');
                if (parts.length > 1) locationText = parts.slice(1).join('·').trim();
            }
        }
        const plainText = cleanBodyHtml.replace(/<p>/g, '\n').replace(/<\/p>/g, '').replace(/<[^>]+>/g, '');

        if (dateInput) dateInput.value = letter.date || '';
        if (titleInput) titleInput.value = titleText;
        if (contentInput) contentInput.value = plainText.trim();

        const signInput = document.getElementById('letterSign');
        if (signInput) signInput.value = signText;

        const locationInput = document.getElementById('letterLocation');
        if (locationInput) locationInput.value = locationText;

        this.selectBook(this.currentBook.id);
    }

    formatDateToChinese(dateStr) {
        const match = dateStr.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
        if (match) {
            return `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
        }
        return dateStr;
    }

    async submitLetter() {
        const bookId = document.querySelector('.book-select-item.selected')?.dataset.bookId || this.currentBook?.id || 'jing';
        const date = document.getElementById('letterDate')?.value?.trim();
        const title = document.getElementById('letterTitle')?.value?.trim();
        const content = document.getElementById('letterContent')?.value?.trim();
        const sign = document.getElementById('letterSign')?.value?.trim();
        const location = document.getElementById('letterLocation')?.value?.trim();

        if (!date) {
            alert('请填写日期');
            return;
        }
        if (!content) {
            alert('请写点什么吧');
            return;
        }

        const submitBtn = document.getElementById('submitLetterBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingLetterId ? '保存中...' : '寄送中...';
        }

        const safeTitle = UIUtils.escapeHtml(title || '');
        const safeContent = UIUtils.escapeHtml(content || '');
        const safeSign = UIUtils.escapeHtml(sign || '');
        const safeLocation = UIUtils.escapeHtml(location || '');

        const paragraphs = safeContent.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n');
        const titleHtml = safeTitle ? `<h4 style="text-align:center; margin-bottom:20px; font-weight:600;">${safeTitle}</h4>\n` : '';
        let signHtml = '';
        if (safeSign) {
            const chineseDate = UIUtils.escapeHtml(this.formatDateToChinese(date));
            const locationPart = safeLocation ? ` · ${safeLocation}` : '';
            signHtml = `\n<p style="text-align: right;">${safeSign}</p>\n<p style="text-align: right; color: #999; font-size: 13px;">${chineseDate}${locationPart}</p>`;
        }
        const htmlContent = `${titleHtml}${paragraphs}${signHtml}`;

        if (this.supabase) {
            try {
                if (this.editingLetterId) {
                    console.log('LoveLetters: 更新信件', { id: this.editingLetterId, book_id: bookId, date: date });
                    const { data: updateData, error: updateError } = await this.supabase
                        .from(CONFIG.supabase.lettersTable)
                        .update({
                            book_id: bookId,
                            date: date,
                            content: htmlContent
                        })
                        .eq('id', this.editingLetterId)
                        .select();

                    if (updateError) throw updateError;
                    console.log('LoveLetters: 更新结果', updateData);
                } else {
                    const { data: existingLetters, error: countError } = await this.supabase
                        .from(CONFIG.supabase.lettersTable)
                        .select('sort_order')
                        .eq('book_id', bookId)
                        .order('sort_order', { ascending: false })
                        .limit(1);

                    const maxOrder = existingLetters && existingLetters.length > 0 ? existingLetters[0].sort_order : 0;

                    const { error: insertError } = await this.supabase
                        .from(CONFIG.supabase.lettersTable)
                        .insert([{
                            book_id: bookId,
                            date: date,
                            content: htmlContent,
                            sort_order: maxOrder + 1
                        }]);

                    if (insertError) throw insertError;
                }

                this.lettersData = null;
                CacheManager.remove('loveLetters_cache');
                await this.loadLettersData(true);

                if (this.currentBook) {
                    const updatedBook = this.lettersData.books.find(b => b.id === this.currentBook.id);
                    if (updatedBook) {
                        this.currentBook = updatedBook;
                    }
                }

                if (submitBtn) {
                    submitBtn.textContent = '✅ 保存成功！';
                    submitBtn.style.background = '#4CAF50';
                }

                setTimeout(() => {
                    const wasEditing = !!this.editingLetterId;
                    if (wasEditing) {
                        this.goToReadView();
                    } else {
                        this.goToBookSelection();
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = wasEditing ? '保存修改 💾' : '寄出这封信 💌';
                        submitBtn.style.background = '';
                    }
                    this.editingLetterId = null;
                }, 1200);

                return;
            } catch (error) {
                console.error('LoveLetters: 保存信件失败:', error);
                alert('保存失败，请重试');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = this.editingLetterId ? '保存修改 💾' : '寄出这封信 💌';
                }
                return;
            }
        }

        alert('未连接 Supabase，无法保存信件');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = this.editingLetterId ? '保存修改 💾' : '寄出这封信 💌';
        }
    }

    goToReadView() {
        const readingView = document.getElementById('bookReadingView');
        const writeView = document.getElementById('writeLetterView');

        if (readingView) readingView.classList.add('active');
        if (writeView) writeView.classList.remove('active');

        this.currentPageIndex = this.editedPageIndex;
        this.renderPages();
        this.updateNavigation();

        this.editingLetterId = null;
    }

    openBook(bookId) {
        const book = this.lettersData.books.find(b => b.id === bookId);
        if (!book || !book.letters || book.letters.length === 0) return;

        this.currentBook = book;
        this.currentPageIndex = 0;
        this.editingLetterId = null;

        const selectionView = document.getElementById('bookSelectionView');
        const readingView = document.getElementById('bookReadingView');

        if (selectionView && readingView) {
            selectionView.style.display = 'none';
            readingView.classList.add('active');
        }

        this.renderPages();
        this.updateNavigation();

        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }
    }

    renderPages() {
        const wrapper = document.getElementById('pagesWrapper');
        if (!wrapper || !this.currentBook) return;

        wrapper.innerHTML = this.currentBook.letters.map((letter, index) => {
            const htmlContent = letter.content || '';
            const divSignMatch = htmlContent.match(/<div class="letter-signature"[^>]*>([\s\S]*?)<\/div>\s*$/i);
            const inlineSignMatch = htmlContent.match(/(<p\s+style="text-align:\s*right;?"[^>]*>[\s\S]*?<\/p>\s*<p\s+style="text-align:\s*right;?[^"]*color:\s*#999[^"]*"[^>]*>[\s\S]*?<\/p>)\s*$/i);
            let signHtml = '';
            let displayContent = htmlContent;
            if (divSignMatch) {
                signHtml = divSignMatch[1];
                displayContent = htmlContent.replace(/<div class="letter-signature"[^>]*>[\s\S]*?<\/div>\s*$/, '');
            } else if (inlineSignMatch) {
                signHtml = inlineSignMatch[1];
                displayContent = htmlContent.replace(/(<p\s+style="text-align:\s*right;?"[^>]*>[\s\S]*?<\/p>\s*<p\s+style="text-align:\s*right;?[^"]*color:\s*#999[^"]*"[^>]*>[\s\S]*?<\/p>)\s*$/, '');
            }
            return `
            <div class="book-page" data-page-index="${index}" style="${index === this.currentPageIndex ? '' : 'display:none;'}">
                <div class="book-page-content">
                    <div class="letter-text">${displayContent}</div>
                    ${signHtml ? `<div class="letter-signature">${signHtml}</div>` : `<div class="letter-date">${letter.date}</div>`}
                    <button class="edit-letter-btn" onclick="loveLetters.showEditView(${index})">✏️ 编辑</button>
                </div>
            </div>
        `}).join('');
    }

    updateNavigation() {
        if (!this.currentBook) return;

        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const indicator = document.getElementById('pageIndicator');

        if (prevBtn) prevBtn.disabled = this.currentPageIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentPageIndex >= this.currentBook.letters.length - 1;
        if (indicator) indicator.textContent = `${this.currentPageIndex + 1} / ${this.currentBook.letters.length}`;
    }

    flipPage(direction) {
        if (this.isFlipping || !this.currentBook) return;

        const totalPages = this.currentBook.letters.length;
        const newPageIndex = this.currentPageIndex + direction;

        if (newPageIndex < 0 || newPageIndex >= totalPages) return;

        this.isFlipping = true;

        const pages = document.querySelectorAll('.book-page');
        const currentPage = pages[this.currentPageIndex];
        const nextPage = pages[newPageIndex];

        if (!currentPage || !nextPage) {
            this.isFlipping = false;
            return;
        }

        nextPage.style.display = '';

        requestAnimationFrame(() => {
            if (direction > 0) {
                currentPage.style.transform = 'translateX(-100%)';
                currentPage.style.opacity = '0';
                nextPage.style.transform = 'translateX(100%)';
                nextPage.style.opacity = '0';

                requestAnimationFrame(() => {
                    nextPage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    nextPage.style.transform = 'translateX(0)';
                    nextPage.style.opacity = '1';
                    currentPage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                });
            } else {
                currentPage.style.transform = 'translateX(100%)';
                currentPage.style.opacity = '0';
                nextPage.style.transform = 'translateX(-100%)';
                nextPage.style.opacity = '0';

                requestAnimationFrame(() => {
                    nextPage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    nextPage.style.transform = 'translateX(0)';
                    nextPage.style.opacity = '1';
                    currentPage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                });
            }

            setTimeout(() => {
                currentPage.style.display = 'none';
                currentPage.style.transition = '';
                currentPage.style.transform = '';
                currentPage.style.opacity = '';
                nextPage.style.transition = '';
                nextPage.style.transform = '';
                nextPage.style.opacity = '';

                this.currentPageIndex = newPageIndex;
                this.updateNavigation();
                this.isFlipping = false;

                if ('vibrate' in navigator) {
                    navigator.vibrate(8);
                }
            }, 550);
        });
    }

    goToBookSelection() {
        const selectionView = document.getElementById('bookSelectionView');
        const readingView = document.getElementById('bookReadingView');
        const writeView = document.getElementById('writeLetterView');

        if (selectionView) selectionView.style.display = 'block';
        if (readingView) readingView.classList.remove('active');
        if (writeView) writeView.classList.remove('active');

        this.currentBook = null;
        this.currentPageIndex = 0;
        this.editingLetterId = null;

        this.renderBookCovers();
    }

    bindEvents() {
        if (this.boundEvents) {
            this.unbindEvents();
        }

        const handlePrev = () => this.flipPage(-1);
        const handleNext = () => this.flipPage(1);

        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const backBtn = document.getElementById('backToBooksBtn');
        const writeBtn = document.getElementById('writeLetterBtn');
        const backFromWriteBtn = document.getElementById('backFromWriteBtn');
        const submitBtn = document.getElementById('submitLetterBtn');

        if (prevBtn) prevBtn.addEventListener('click', handlePrev);
        if (nextBtn) nextBtn.addEventListener('click', handleNext);
        if (backBtn) backBtn.addEventListener('click', () => this.goToBookSelection());
        if (writeBtn) writeBtn.addEventListener('click', () => this.showWriteView());
        if (backFromWriteBtn) backFromWriteBtn.addEventListener('click', () => {
            if (this.editingLetterId) {
                this.goToReadView();
            } else {
                this.goToBookSelection();
            }
        });
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitLetter());

        const wrapper = document.getElementById('pagesWrapper');
        if (!wrapper) return;

        let pointerDown = false;
        let startX = 0;
        let startY = 0;

        const onPointerDown = (e) => {
            if (this.isFlipping) return;
            pointerDown = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);
        };

        const onPointerMove = (e) => {};

        const onPointerUp = (e) => {
            if (!pointerDown || this.isFlipping) return;
            pointerDown = false;

            const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const endY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);

            if (Math.abs(deltaX) > 50 && deltaY < 60) {
                if (deltaX > 0) {
                    this.flipPage(-1);
                } else {
                    this.flipPage(1);
                }
            }
        };

        const onPointerLeave = () => {
            pointerDown = false;
        };

        wrapper.addEventListener('touchstart', onPointerDown, { passive: true });
        wrapper.addEventListener('touchend', onPointerUp, { passive: true });
        wrapper.addEventListener('mousedown', onPointerDown);
        wrapper.addEventListener('mouseup', onPointerUp);
        wrapper.addEventListener('mouseleave', onPointerLeave);

        this.boundEvents = {
            handlePrev,
            handleNext,
            cleanup: () => {
                wrapper.removeEventListener('touchstart', onPointerDown);
                wrapper.removeEventListener('touchend', onPointerUp);
                wrapper.removeEventListener('mousedown', onPointerDown);
                wrapper.removeEventListener('mouseup', onPointerUp);
                wrapper.removeEventListener('mouseleave', onPointerLeave);
            }
        };
    }

    unbindEvents() {
        if (this.boundEvents) {
            const prevBtn = document.getElementById('prevPageBtn');
            const nextBtn = document.getElementById('nextPageBtn');

            if (prevBtn) prevBtn.removeEventListener('click', this.boundEvents.handlePrev);
            if (nextBtn) nextBtn.removeEventListener('click', this.boundEvents.handleNext);

            if (this.boundEvents.cleanup) {
                this.boundEvents.cleanup();
            }
        }
    }

    close() {
        if (this.modal) {
            this.unbindEvents();
            this.modal.remove();
            this.modal = null;
            this.currentBook = null;
            this.currentPageIndex = 0;
            this.isFlipping = false;
            this.editingLetterId = null;
        }
    }
}

const loveLetters = new LoveLetters();
