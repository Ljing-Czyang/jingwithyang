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
        this.initSupabase();
    }

    initSupabase() {
        try {
            if (CONFIG.supabase.url !== 'YOUR_SUPABASE_URL' && CONFIG.supabase.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
                this.supabase = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
            }
        } catch (error) {
            console.error('LoveLetters: 初始化 Supabase 失败:', error);
        }
    }

    async loadLettersData() {
        if (this.lettersData) return this.lettersData;

        if (this.supabase) {
            try {
                const { data: books, error: booksError } = await this.supabase
                    .from(CONFIG.supabase.letterBooksTable)
                    .select('*')
                    .order('created_at', { ascending: true });

                if (booksError) throw booksError;

                const { data: letters, error: lettersError } = await this.supabase
                    .from(CONFIG.supabase.lettersTable)
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (lettersError) throw lettersError;

                this.lettersData = {
                    books: books.map(book => ({
                        id: book.id,
                        title: book.title,
                        subtitle: book.subtitle,
                        color: book.color,
                        bgColor: book.bg_color,
                        coverIcon: book.cover_icon,
                        letters: letters
                            .filter(letter => letter.book_id === book.id)
                            .map(letter => ({
                                date: letter.date,
                                content: letter.content
                            }))
                    }))
                };

                console.log('LoveLetters: 从 Supabase 加载信件成功');
                return this.lettersData;
            } catch (error) {
                console.error('LoveLetters: 从 Supabase 加载失败，使用本地数据:', error);
            }
        }

        this.lettersData = LETTERS_DATA || { books: [] };
        return this.lettersData;
    }

    async show() {
        if (this.modal) {
            this.close();
        }

        await this.loadLettersData();

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
            </div>
        `;

        document.body.appendChild(this.modal);
        this.renderBookCovers();
        this.bindEvents();

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
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
                    <div class="book-decoration"></div>
                </div>
            </div>
        `).join('');
    }

    openBook(bookId) {
        const book = this.lettersData.books.find(b => b.id === bookId);
        if (!book || !book.letters || book.letters.length === 0) return;

        this.currentBook = book;
        this.currentPageIndex = 0;

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

        wrapper.innerHTML = this.currentBook.letters.map((letter, index) => `
            <div class="book-page" data-page-index="${index}" style="${index === 0 ? '' : 'display:none;'}">
                <div class="book-page-content">
                    <div class="letter-date">${letter.date}</div>
                    <div class="letter-text">${letter.content}</div>
                </div>
            </div>
        `).join('');
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

        if (selectionView && readingView) {
            selectionView.style.display = 'block';
            readingView.classList.remove('active');
        }

        this.currentBook = null;
        this.currentPageIndex = 0;
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

        if (prevBtn) prevBtn.addEventListener('click', handlePrev);
        if (nextBtn) nextBtn.addEventListener('click', handleNext);
        if (backBtn) backBtn.addEventListener('click', () => this.goToBookSelection());

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
        }
    }
}

const loveLetters = new LoveLetters();
