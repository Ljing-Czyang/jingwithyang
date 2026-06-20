/**
 * 记账组件分类配置
 * 定义支出和收入的分类列表及对应图标
 */
const ACCOUNT_CATEGORIES = {
    expense: [
        { value: 'food', label: '餐饮', icon: '🍜' },
        { value: 'transport', label: '交通', icon: '🚇' },
        { value: 'shopping', label: '购物', icon: '🛍️' },
        { value: 'entertainment', label: '娱乐', icon: '🎮' },
        { value: 'home', label: '居家', icon: '🏠' },
        { value: 'medical', label: '医疗', icon: '💊' },
        { value: 'other_expense', label: '其他', icon: '📝' }
    ],
    income: [
        { value: 'salary', label: '工资', icon: '💰' },
        { value: 'redpacket', label: '红包', icon: '🧧' },
        { value: 'parttime', label: '兼职', icon: '💼' },
        { value: 'other_income', label: '其他', icon: '📥' }
    ]
};

class AccountBook {
    constructor() {
        /** @type {HTMLElement|null} 当前弹窗根节点 */
        this.modal = null;
        /** @type {Array<Object>} 交易记录数据列表 */
        this.records = [];
        /** @type {Object|null} Supabase 客户端实例 */
        this.supabase = null;
        /** @type {string} 本地存储键名 */
        this.localKey = 'accounts_local';
        /** @type {string} 当前选中的交易类型 'expense' 或 'income' */
        this.currentType = 'expense';
        /** @type {string} 当前选中的分类值 */
        this.currentCategory = 'food';
        /** @type {string|null} 当前编辑中的记录 ID */
        this.editingId = null;
        /** @type {string} 当前查看的月份 'YYYY-MM' */
        this.viewMonth = this.getCurrentMonth();
        this.initSupabase();
        this.prefetch();
    }

    /**
     * 初始化 Supabase 客户端，失败时回退到本地存储模式。
     * @returns {void}
     */
    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
        } catch (error) {
            console.error('AccountBook: 初始化 Supabase 失败:', error);
        }
    }

    /**
     * 获取当前月份字符串。
     * @returns {string} 返回 'YYYY-MM' 格式的月份字符串。
     */
    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    /**
     * 预加载交易记录数据，优先从缓存读取，同时异步从 Supabase 拉取最新数据。
     * @returns {void}
     */
    prefetch() {
        const cached = DataUtils.loadCachedList('accounts_cache', []);
        if (cached.length > 0) {
            this.records = cached;
        }
        if (this.supabase) {
            this.loadRecords(true);
        } else {
            this.records = this.loadRecordsFromLocal();
        }
    }

    /**
     * 从 Supabase 或本地存储加载交易记录。
     * @param {boolean} forceRefresh 是否强制刷新跳过缓存。
     * @returns {Promise<Array<Object>>} 返回交易记录数组。
     */
    async loadRecords(forceRefresh) {
        if (this.supabase) {
            this.records = await DataUtils.loadSupabaseList({
                currentData: this.records,
                forceRefresh: forceRefresh,
                supabase: this.supabase,
                cacheKey: 'accounts_cache',
                tableName: CONFIG.supabase.accountsTable,
                orderColumn: 'record_date',
                ascending: false,
                logLabel: 'AccountBook',
                mapItem: r => ({
                    id: r.id,
                    type: r.type,
                    amount: r.amount,
                    category: r.category,
                    recordDate: r.record_date,
                    note: r.note || '',
                    createdBy: r.created_by,
                    createdAt: r.created_at
                })
            });
        } else {
            this.records = this.loadRecordsFromLocal();
        }
        return this.records;
    }

    /**
     * 从 localStorage 加载本地交易记录。
     * @returns {Array<Object>} 返回本地存储的交易记录数组。
     */
    loadRecordsFromLocal() {
        try {
            const data = localStorage.getItem(this.localKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 将交易记录保存到 localStorage。
     * @returns {void}
     */
    saveRecordsToLocal() {
        try {
            localStorage.setItem(this.localKey, JSON.stringify(this.records));
        } catch (e) {
            console.error('保存记录到本地失败:', e);
        }
    }

    /**
     * 显示记账弹窗，创建模态框并渲染内容。
     * @returns {Promise<void>}
     */
    async show() {
        if (this.modal) {
            this.close();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'ab-modal';
        this.modal.innerHTML = this.renderModal();
        document.body.appendChild(this.modal);

        this.bindEvents();
        await this.loadRecords(true);
        this.renderAll();

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    /**
     * 关闭记账弹窗。
     * @returns {void}
     */
    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        this.editingId = null;
    }

    /**
     * 渲染弹窗 HTML 结构，包含统计区、图表区、记录列表和添加表单。
     * @returns {string} 返回弹窗 HTML 字符串。
     */
    renderModal() {
        return `
            <div class="ab-container">
                <div class="ab-header">
                    <h3>💰 记账本</h3>
                    <button class="ab-close" onclick="accountBook.close()">✕</button>
                </div>
                <div class="ab-body" id="ab-body">
                    ${UIUtils.getLoadingView()}
                </div>
                <div class="ab-footer">
                    <div class="ab-type-switch">
                        <div class="ab-type-btn ${this.currentType === 'expense' ? 'active' : ''}" data-type="expense" onclick="accountBook.switchType('expense')">支出</div>
                        <div class="ab-type-btn ${this.currentType === 'income' ? 'active' : ''}" data-type="income" onclick="accountBook.switchType('income')">收入</div>
                    </div>
                    <div class="ab-category-row" id="ab-category-row">
                        ${this.renderCategoryButtons()}
                    </div>
                    <div class="ab-input-row">
                        <input type="number" id="ab-amount-input" class="ab-amount-input" placeholder="金额" step="0.01" min="0" />
                        <input type="date" id="ab-date-input" class="ab-date-input" value="${this.getToday()}" />
                    </div>
                    <div class="ab-input-row">
                        <input type="text" id="ab-note-input" class="ab-note-input" placeholder="备注（可选）" maxlength="50" />
                        <div class="ab-author-select">
                            <div class="ab-author-item selected" data-author="境" onclick="accountBook.selectAuthor('境')">🌿 境</div>
                            <div class="ab-author-item" data-author="扬" onclick="accountBook.selectAuthor('扬')">🌙 扬</div>
                        </div>
                    </div>
                    <button class="ab-add-btn" id="ab-add-btn" onclick="accountBook.addRecord()">添加记录</button>
                </div>
            </div>
        `;
    }

    /**
     * 获取今天的日期字符串。
     * @returns {string} 返回 'YYYY-MM-DD' 格式的日期字符串。
     */
    getToday() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * 渲染分类按钮列表。
     * @returns {string} 返回分类按钮 HTML。
     */
    renderCategoryButtons() {
        const categories = ACCOUNT_CATEGORIES[this.currentType];
        return categories.map(cat => `
            <div class="ab-cat-btn ${this.currentCategory === cat.value ? 'active' : ''}"
                 data-cat="${cat.value}"
                 onclick="accountBook.selectCategory('${cat.value}')">
                <span class="ab-cat-icon">${cat.icon}</span>
                <span class="ab-cat-label">${cat.label}</span>
            </div>
        `).join('');
    }

    /**
     * 绑定弹窗内的事件，包括回车提交和输入框交互。
     * @returns {void}
     */
    bindEvents() {
        const amountInput = document.getElementById('ab-amount-input');
        if (amountInput) {
            amountInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.addRecord();
                }
            });
        }
        const noteInput = document.getElementById('ab-note-input');
        if (noteInput) {
            noteInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addRecord();
                }
            });
        }
    }

    /**
     * 切换交易类型（支出/收入），并更新分类列表。
     * @param {string} type 交易类型 'expense' 或 'income'。
     * @returns {void}
     */
    switchType(type) {
        this.currentType = type;
        this.currentCategory = ACCOUNT_CATEGORIES[type][0].value;
        document.querySelectorAll('.ab-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        const catRow = document.getElementById('ab-category-row');
        if (catRow) {
            catRow.innerHTML = this.renderCategoryButtons();
        }
    }

    /**
     * 选择交易分类。
     * @param {string} cat 分类值。
     * @returns {void}
     */
    selectCategory(cat) {
        this.currentCategory = cat;
        document.querySelectorAll('.ab-cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === cat);
        });
    }

    /**
     * 选择记账人。
     * @param {string} author 记账人名称。
     * @returns {void}
     */
    selectAuthor(author) {
        document.querySelectorAll('.ab-author-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.author === author);
        });
    }

    /**
     * 添加或保存编辑的交易记录。
     * @returns {Promise<void>}
     */
    async addRecord() {
        const author = document.querySelector('.ab-author-item.selected')?.dataset.author || '境';
        const amount = parseFloat(document.getElementById('ab-amount-input')?.value);
        const recordDate = document.getElementById('ab-date-input')?.value;
        const note = document.getElementById('ab-note-input')?.value?.trim() || '';

        if (!amount || amount <= 0) {
            alert('请输入有效金额');
            return;
        }
        if (!recordDate) {
            alert('请选择日期');
            return;
        }

        const addBtn = document.getElementById('ab-add-btn');
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = '...';
        }

        if (this.editingId) {
            await this.saveEdit(author, amount, recordDate, note, addBtn);
        } else {
            await this.createNewRecord(author, amount, recordDate, note, addBtn);
        }
    }

    /**
     * 创建新交易记录并保存到 Supabase 或本地存储。
     * @param {string} author 记账人。
     * @param {number} amount 金额。
     * @param {string} recordDate 记录日期。
     * @param {string} note 备注。
     * @param {HTMLElement} addBtn 添加按钮元素。
     * @returns {Promise<void>}
     */
    async createNewRecord(author, amount, recordDate, note, addBtn) {
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.accountsTable)
                    .insert([{
                        type: this.currentType,
                        amount: amount,
                        category: this.currentCategory,
                        record_date: recordDate,
                        note: note,
                        created_by: author
                    }]);

                if (error) throw error;

                CacheManager.remove('accounts_cache');
                await this.loadRecords(true);
                this.renderAll();
                this.resetForm(addBtn);
                return;
            } catch (error) {
                console.error('AccountBook: 添加失败:', error);
                alert('添加失败，请重试');
            }
        } else {
            const record = {
                id: `ab_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                type: this.currentType,
                amount: amount,
                category: this.currentCategory,
                recordDate: recordDate,
                note: note,
                createdBy: author,
                createdAt: new Date().toISOString()
            };
            this.records.push(record);
            this.saveRecordsToLocal();
            this.renderAll();
            this.resetForm(addBtn);
            return;
        }

        if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = '添加记录';
        }
    }

    /**
     * 重置表单输入框并恢复按钮状态。
     * @param {HTMLElement} addBtn 添加按钮元素。
     * @returns {void}
     */
    resetForm(addBtn) {
        const amountInput = document.getElementById('ab-amount-input');
        const noteInput = document.getElementById('ab-note-input');
        if (amountInput) amountInput.value = '';
        if (noteInput) noteInput.value = '';
        if (addBtn) {
            addBtn.textContent = '✓';
            addBtn.style.background = '#4CAF50';
            setTimeout(() => {
                if (addBtn) {
                    addBtn.disabled = false;
                    addBtn.textContent = '添加记录';
                    addBtn.style.background = '';
                }
            }, 800);
        }
    }

    /**
     * 进入编辑模式，将记录数据填入底部表单。
     * @param {string} id 记录 ID。
     * @returns {void}
     */
    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        this.editingId = id;
        this.currentType = record.type;
        this.currentCategory = record.category;

        this.switchType(record.type);
        this.selectCategory(record.category);

        const amountInput = document.getElementById('ab-amount-input');
        const dateInput = document.getElementById('ab-date-input');
        const noteInput = document.getElementById('ab-note-input');
        const addBtn = document.getElementById('ab-add-btn');

        if (amountInput) amountInput.value = record.amount;
        if (dateInput) dateInput.value = record.recordDate;
        if (noteInput) noteInput.value = record.note || '';
        this.selectAuthor(record.createdBy);

        if (addBtn) {
            addBtn.textContent = '保存修改';
        }

        const body = document.getElementById('ab-body');
        if (body) body.scrollTop = body.scrollHeight;

        if (amountInput) amountInput.focus();
    }

    /**
     * 保存编辑后的记录。
     * @param {string} author 记账人。
     * @param {number} amount 金额。
     * @param {string} recordDate 记录日期。
     * @param {string} note 备注。
     * @param {HTMLElement} addBtn 添加按钮元素。
     * @returns {Promise<void>}
     */
    async saveEdit(author, amount, recordDate, note, addBtn) {
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.accountsTable)
                    .update({
                        type: this.currentType,
                        amount: amount,
                        category: this.currentCategory,
                        record_date: recordDate,
                        note: note,
                        created_by: author
                    })
                    .eq('id', this.editingId);

                if (error) throw error;

                CacheManager.remove('accounts_cache');
                await this.loadRecords(true);
            } catch (error) {
                console.error('AccountBook: 编辑失败:', error);
                alert('保存失败，请重试');
                if (addBtn) {
                    addBtn.disabled = false;
                    addBtn.textContent = '保存修改';
                }
                return;
            }
        } else {
            const record = this.records.find(r => r.id === this.editingId);
            if (record) {
                record.type = this.currentType;
                record.amount = amount;
                record.category = this.currentCategory;
                record.recordDate = recordDate;
                record.note = note;
                record.createdBy = author;
                this.saveRecordsToLocal();
            }
        }

        this.editingId = null;
        const amountInput = document.getElementById('ab-amount-input');
        const noteInput = document.getElementById('ab-note-input');
        if (amountInput) amountInput.value = '';
        if (noteInput) noteInput.value = '';
        if (addBtn) {
            addBtn.textContent = '添加记录';
            addBtn.disabled = false;
        }
        this.renderAll();
    }

    /**
     * 删除指定交易记录。
     * @param {string} id 记录 ID。
     * @returns {Promise<void>}
     */
    async deleteRecord(id) {
        if (!confirm('确定删除这条记录吗？')) return;

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.accountsTable)
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('accounts_cache');
                await this.loadRecords(true);
                this.renderAll();
            } catch (error) {
                console.error('AccountBook: 删除失败:', error);
                alert('删除失败，请重试');
            }
        } else {
            this.records = this.records.filter(r => r.id !== id);
            this.saveRecordsToLocal();
            this.renderAll();
        }
    }

    /**
     * 渲染整个弹窗内容，包括统计区、图表区和记录列表。
     * @returns {void}
     */
    renderAll() {
        const body = document.getElementById('ab-body');
        if (!body) return;

        const monthRecords = this.records.filter(r => r.recordDate.startsWith(this.viewMonth));
        const stats = this.calcMonthStats(monthRecords);

        body.innerHTML = `
            <div class="ab-month-nav">
                <button class="ab-month-btn" onclick="accountBook.changeMonth(-1)">‹</button>
                <span class="ab-month-label">${this.viewMonth.replace('-', '年')}月</span>
                <button class="ab-month-btn" onclick="accountBook.changeMonth(1)">›</button>
            </div>
            <div class="ab-stats">
                <div class="ab-stat-card ab-stat-income">
                    <span class="ab-stat-label">收入</span>
                    <span class="ab-stat-value">¥${stats.income.toFixed(2)}</span>
                </div>
                <div class="ab-stat-card ab-stat-expense">
                    <span class="ab-stat-label">支出</span>
                    <span class="ab-stat-value">¥${stats.expense.toFixed(2)}</span>
                </div>
                <div class="ab-stat-card ab-stat-balance">
                    <span class="ab-stat-label">结余</span>
                    <span class="ab-stat-value ${stats.balance >= 0 ? '' : 'ab-negative'}">¥${stats.balance.toFixed(2)}</span>
                </div>
            </div>
            <div class="ab-charts">
                <div class="ab-chart-section">
                    <h4 class="ab-chart-title">支出分类</h4>
                    <canvas id="ab-pie-chart" width="280" height="280"></canvas>
                </div>
                <div class="ab-chart-section">
                    <h4 class="ab-chart-title">收支趋势</h4>
                    <canvas id="ab-trend-chart" width="280" height="280"></canvas>
                </div>
            </div>
            <div class="ab-list" id="ab-list">
                ${this.renderRecordList(monthRecords)}
            </div>
        `;

        this.drawPieChart(stats.categoryStats);
        this.drawTrendChart();
    }

    /**
     * 计算指定月份的收支统计数据。
     * @param {Array<Object>} records 该月的交易记录数组。
     * @returns {Object} 返回包含 income、expense、balance、categoryStats 的统计对象。
     */
    calcMonthStats(records) {
        let income = 0, expense = 0;
        const categoryStats = {};

        records.forEach(r => {
            if (r.type === 'income') {
                income += r.amount;
            } else {
                expense += r.amount;
                categoryStats[r.category] = (categoryStats[r.category] || 0) + r.amount;
            }
        });

        return { income, expense, balance: income - expense, categoryStats };
    }

    /**
     * 切换查看月份。
     * @param {number} delta 月份偏移量，-1 为上月，1 为下月。
     * @returns {void}
     */
    changeMonth(delta) {
        const [year, month] = this.viewMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + delta, 1);
        this.viewMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        this.renderAll();
    }

    /**
     * 渲染交易记录列表。
     * @param {Array<Object>} records 交易记录数组。
     * @returns {string} 返回记录列表 HTML。
     */
    renderRecordList(records) {
        if (records.length === 0) {
            return '<div class="ab-empty">本月还没有记录</div>';
        }

        const sorted = [...records].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

        return sorted.map(r => {
            const cat = this.getCategoryInfo(r.type, r.category);
            const isIncome = r.type === 'income';
            const amountClass = isIncome ? 'ab-amount-income' : 'ab-amount-expense';
            const sign = isIncome ? '+' : '-';

            return `
                <div class="ab-record ${this.editingId === r.id ? 'ab-record-editing' : ''}">
                    <div class="ab-record-icon">${cat.icon}</div>
                    <div class="ab-record-content">
                        <div class="ab-record-top">
                            <span class="ab-record-cat">${cat.label}</span>
                            <span class="ab-record-amount ${amountClass}">${sign}¥${r.amount.toFixed(2)}</span>
                        </div>
                        <div class="ab-record-bottom">
                            <span class="ab-record-date">${this.formatDate(r.recordDate)}</span>
                            <span class="ab-record-author">${r.createdBy === '境' ? '🌿' : '🌙'} ${r.createdBy}</span>
                            ${r.note ? `<span class="ab-record-note">${this.escapeHtml(r.note)}</span>` : ''}
                        </div>
                    </div>
                    <div class="ab-record-actions">
                        <button class="ab-record-btn" onclick="accountBook.editRecord('${r.id}')">✏️</button>
                        <button class="ab-record-btn" onclick="accountBook.deleteRecord('${r.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 获取分类信息（图标和标签）。
     * @param {string} type 交易类型。
     * @param {string} category 分类值。
     * @returns {Object} 返回包含 icon 和 label 的分类对象。
     */
    getCategoryInfo(type, category) {
        const cats = ACCOUNT_CATEGORIES[type] || ACCOUNT_CATEGORIES.expense;
        return cats.find(c => c.value === category) || { icon: '📝', label: '其他' };
    }

    /**
     * 格式化日期显示文本。
     * @param {string} dateStr 日期字符串 'YYYY-MM-DD'。
     * @returns {string} 返回格式化后的日期文本。
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    /**
     * 转义 HTML 特殊字符。
     * @param {string} text 需要转义的文本。
     * @returns {string} 返回转义后的安全文本。
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * 绘制支出分类饼图。
     * @param {Object} categoryStats 分类金额统计对象 { category: amount }。
     * @returns {void}
     */
    drawPieChart(categoryStats) {
        const canvas = document.getElementById('ab-pie-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 280;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, size, size);

        const entries = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
        const total = entries.reduce((sum, [, v]) => sum + v, 0);

        if (total === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无支出数据', size / 2, size / 2);
            return;
        }

        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.35;
        const innerRadius = radius * 0.5;
        let startAngle = -Math.PI / 2;

        const colors = ['#ff6b81', '#feca57', '#48dbfb', '#1dd1a1', '#a55eea', '#54a0ff', '#ff9ff3'];

        entries.forEach(([cat, value], i) => {
            const angle = (value / total) * Math.PI * 2;
            const color = colors[i % colors.length];

            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
            ctx.arc(cx, cy, innerRadius, startAngle + angle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            if (angle > 0.3) {
                const midAngle = startAngle + angle / 2;
                const labelRadius = (radius + innerRadius) / 2;
                const lx = cx + Math.cos(midAngle) * labelRadius;
                const ly = cy + Math.sin(midAngle) * labelRadius;
                const catInfo = this.getCategoryInfo('expense', cat);
                const pct = ((value / total) * 100).toFixed(0);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${catInfo.label} ${pct}%`, lx, ly);
            }

            startAngle += angle;
        });
    }

    /**
     * 绘制近 6 个月收支趋势折线图。
     * @returns {void}
     */
    drawTrendChart() {
        const canvas = document.getElementById('ab-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 280, h = 280;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, w, h);

        const months = this.getLast6Months();
        const data = months.map(m => {
            const monthRecords = this.records.filter(r => r.recordDate.startsWith(m));
            const stats = this.calcMonthStats(monthRecords);
            return { month: m, income: stats.income, expense: stats.expense };
        });

        const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
        const padding = { top: 30, right: 20, bottom: 40, left: 50 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();
        }

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            const val = maxVal * (1 - i / 4);
            ctx.fillText('¥' + val.toFixed(0), padding.left - 5, y + 3);
        }

        ctx.textAlign = 'center';
        data.forEach((d, i) => {
            const x = padding.left + (chartW / (data.length - 1)) * i;
            const [year, month] = d.month.split('-');
            ctx.fillText(parseInt(month) + '月', x, h - padding.bottom + 15);
        });

        const drawLine = (key, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach((d, i) => {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                const y = padding.top + chartH - (d[key] / maxVal) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            data.forEach((d, i) => {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                const y = padding.top + chartH - (d[key] / maxVal) * chartH;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });
        };

        drawLine('income', '#1dd1a1');
        drawLine('expense', '#ff6b81');

        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1dd1a1';
        ctx.fillText('● 收入', padding.left, padding.top - 10);
        ctx.fillStyle = '#ff6b81';
        ctx.fillText('● 支出', padding.left + 50, padding.top - 10);
    }

    /**
     * 获取近 6 个月的月份字符串列表。
     * @returns {Array<string>} 返回 'YYYY-MM' 格式的月份数组，从最早到最近。
     */
    getLast6Months() {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        }
        return months;
    }
}

const accountBook = new AccountBook();
