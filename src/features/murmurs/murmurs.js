class Murmurs {
    constructor() {
        this.modal = null;
        this.murmursData = [];
        this.supabase = null;
        this.initSupabase();
        this.prefetch();
    }

    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
        } catch (error) {
            console.error('Murmurs: 初始化 Supabase 失败:', error);
        }
    }

    prefetch() {
        const cached = this.loadCachedData();
        if (cached) {
            this.murmursData = cached;
        }
        if (this.supabase) {
            this.loadMurmursData(!cached);
        }
    }

    loadCachedData() {
        try {
            const cached = localStorage.getItem('murmurs_cache');
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    return data;
                }
            }
        } catch (e) {}
        return null;
    }

    saveCachedData(data) {
        try {
            localStorage.setItem('murmurs_cache', JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {}
    }

    async loadMurmursData(forceRefresh) {
        if (this.murmursData.length > 0 && !forceRefresh) return this.murmursData;

        if (!forceRefresh) {
            const cached = this.loadCachedData();
            if (cached) {
                this.murmursData = cached;
                return this.murmursData;
            }
        }

        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from(CONFIG.supabase.murmursTable)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                this.murmursData = data.map(m => ({
                    id: m.id,
                    author: m.author,
                    content: m.content,
                    mood: m.mood || '💭',
                    createdAt: m.created_at
                }));

                this.saveCachedData(this.murmursData);
                console.log('Murmurs: 从 Supabase 加载成功');
                return this.murmursData;
            } catch (error) {
                console.error('Murmurs: 从 Supabase 加载失败:', error);
            }
        }

        this.murmursData = [];
        return this.murmursData;
    }

    show() {
        if (this.modal) {
            this.close();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'murmurs-modal';
        this.modal.innerHTML = `
            <div class="murmurs-container">
                <div class="murmurs-header">
                    <h3>💭 碎碎念</h3>
                    <button class="murmurs-close" onclick="murmurs.close()">✕</button>
                </div>

                <div class="murmurs-input-area">
                    <div class="murmurs-author-select">
                        <div class="murmurs-author-item selected" data-author="境" onclick="murmurs.selectAuthor('境')">🌿 境</div>
                        <div class="murmurs-author-item" data-author="扬" onclick="murmurs.selectAuthor('扬')">🌙 扬</div>
                    </div>
                    <div class="murmurs-input-row">
                        <div class="murmurs-mood-select" id="moodSelect" onclick="murmurs.toggleMoodPicker()">💭</div>
                        <input type="text" id="murmurInput" class="murmur-input" placeholder="此刻在想什么..." maxlength="200" />
                        <button class="murmur-send-btn" id="murmurSendBtn" onclick="murmurs.submitMurmur()">发送</button>
                    </div>
                    <div class="murmurs-mood-picker" id="moodPicker">
                        <span class="mood-option" onclick="murmurs.selectMood('💭')">💭</span>
                        <span class="mood-option" onclick="murmurs.selectMood('😊')">😊</span>
                        <span class="mood-option" onclick="murmurs.selectMood('😢')">😢</span>
                        <span class="mood-option" onclick="murmurs.selectMood('😤')">😤</span>
                        <span class="mood-option" onclick="murmurs.selectMood('🥰')">🥰</span>
                        <span class="mood-option" onclick="murmurs.selectMood('😴')">😴</span>
                        <span class="mood-option" onclick="murmurs.selectMood('🤔')">🤔</span>
                        <span class="mood-option" onclick="murmurs.selectMood('🎉')">🎉</span>
                        <span class="mood-option" onclick="murmurs.selectMood('❤️')">❤️</span>
                    </div>
                </div>

                <div class="murmurs-timeline" id="murmursTimeline"></div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.renderTimeline();

        const input = document.getElementById('murmurInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitMurmur();
                }
            });
        }

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    selectAuthor(author) {
        document.querySelectorAll('.murmurs-author-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.author === author);
        });
    }

    toggleMoodPicker() {
        const picker = document.getElementById('moodPicker');
        if (picker) {
            picker.classList.toggle('active');
        }
    }

    selectMood(mood) {
        const btn = document.getElementById('moodSelect');
        if (btn) btn.textContent = mood;

        const picker = document.getElementById('moodPicker');
        if (picker) picker.classList.remove('active');
    }

    async submitMurmur() {
        const author = document.querySelector('.murmurs-author-item.selected')?.dataset.author || '境';
        const content = document.getElementById('murmurInput')?.value?.trim();
        const mood = document.getElementById('moodSelect')?.textContent || '💭';

        if (!content) return;

        const sendBtn = document.getElementById('murmurSendBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = '...';
        }

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.murmursTable)
                    .insert([{
                        author: author,
                        content: content,
                        mood: mood
                    }]);

                if (error) throw error;

                localStorage.removeItem('murmurs_cache');
                await this.loadMurmursData(true);
                this.renderTimeline();

                const input = document.getElementById('murmurInput');
                if (input) input.value = '';

                if (sendBtn) {
                    sendBtn.textContent = '✓';
                    sendBtn.style.background = '#4CAF50';
                    setTimeout(() => {
                        if (sendBtn) {
                            sendBtn.disabled = false;
                            sendBtn.textContent = '发送';
                            sendBtn.style.background = '';
                        }
                    }, 800);
                }
                return;
            } catch (error) {
                console.error('Murmurs: 发送失败:', error);
                alert('发送失败，请重试');
            }
        } else {
            alert('未连接 Supabase，无法发送');
        }

        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
    }

    async deleteMurmur(id) {
        if (!confirm('确定删除这条碎碎念吗？')) return;

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.murmursTable)
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                localStorage.removeItem('murmurs_cache');
                await this.loadMurmursData(true);
                this.renderTimeline();
            } catch (error) {
                console.error('Murmurs: 删除失败:', error);
                alert('删除失败');
            }
        }
    }

    formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        if (y === now.getFullYear()) {
            return `${m}.${d} ${h}:${min}`;
        }
        return `${y}.${m}.${d} ${h}:${min}`;
    }

    renderTimeline() {
        const timeline = document.getElementById('murmursTimeline');
        if (!timeline) return;

        if (this.murmursData.length === 0) {
            timeline.innerHTML = `
                <div class="murmurs-empty">
                    <div class="murmurs-empty-icon">💭</div>
                    <p>还没有碎碎念</p>
                    <p class="murmurs-empty-hint">写下此刻的想法吧</p>
                </div>
            `;
            return;
        }

        timeline.innerHTML = this.murmursData.map(m => {
            const isJing = m.author === '境';
            return `
                <div class="murmur-item ${isJing ? 'murmur-jing' : 'murmur-yang'}">
                    <div class="murmur-avatar">${isJing ? '🌿' : '🌙'}</div>
                    <div class="murmur-bubble">
                        <div class="murmur-bubble-header">
                            <span class="murmur-author-name">${m.author}</span>
                            <span class="murmur-mood">${m.mood}</span>
                            <span class="murmur-time">${this.formatTime(m.createdAt)}</span>
                        </div>
                        <div class="murmur-content">${this.escapeHtml(m.content)}</div>
                    </div>
                    <button class="murmur-delete-btn" onclick="murmurs.deleteMurmur('${m.id}')">🗑️</button>
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

const murmurs = new Murmurs();
