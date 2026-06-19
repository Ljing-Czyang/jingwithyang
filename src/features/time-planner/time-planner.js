class TimePlanner {
    constructor() {
        /** @type {HTMLElement|null} 当前弹窗根节点 */
        this.modal = null;
        /** @type {Array<Object>} 任务数据列表 */
        this.tasksData = [];
        /** @type {Object|null} Supabase 客户端实例 */
        this.supabase = null;
        /** @type {string} 本地存储键名 */
        this.localKey = 'time_plans_local';
        this.initSupabase();
        this.prefetch();
    }

    /**
     * 初始化 Supabase 客户端，失败时回退到本地存储模式。
     * @returns {void} 该方法不返回值。
     */
    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
        } catch (error) {
            console.error('TimePlanner: 初始化 Supabase 失败:', error);
        }
    }

    /**
     * 预加载任务数据，优先从缓存读取，同时异步从 Supabase 拉取最新数据。
     * @returns {void} 该方法不返回值。
     */
    prefetch() {
        const cached = DataUtils.loadCachedList('time_plans_cache', []);
        if (cached.length > 0) {
            this.tasksData = cached;
        }
        if (this.supabase) {
            this.loadTasksData(true);
        } else {
            this.tasksData = this.loadTasksFromLocal();
        }
    }

    /**
     * 从 Supabase 或本地存储加载任务数据。
     * @param {boolean} forceRefresh 是否强制刷新跳过缓存。
     * @returns {Promise<Array<Object>>} 返回任务数据数组。
     */
    async loadTasksData(forceRefresh) {
        if (this.supabase) {
            this.tasksData = await DataUtils.loadSupabaseList({
                currentData: this.tasksData,
                forceRefresh: forceRefresh,
                supabase: this.supabase,
                cacheKey: 'time_plans_cache',
                tableName: CONFIG.supabase.timePlansTable,
                orderColumn: 'deadline',
                ascending: true,
                logLabel: 'TimePlanner',
                mapItem: t => ({
                    id: t.id,
                    content: t.content,
                    deadline: t.deadline,
                    createdBy: t.created_by,
                    completed: t.completed || false,
                    completedBy: t.completed_by || null,
                    completedAt: t.completed_at || null,
                    createdAt: t.created_at
                })
            });
        } else {
            this.tasksData = this.loadTasksFromLocal();
        }
        return this.tasksData;
    }

    /**
     * 从 localStorage 加载本地任务数据。
     * @returns {Array<Object>} 返回本地存储的任务数组。
     */
    loadTasksFromLocal() {
        try {
            const data = localStorage.getItem(this.localKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 将任务数据保存到 localStorage。
     * @returns {void} 该方法不返回值。
     */
    saveTasksToLocal() {
        try {
            localStorage.setItem(this.localKey, JSON.stringify(this.tasksData));
        } catch (e) {
            console.error('保存任务到本地失败:', e);
        }
    }

    /**
     * 显示时间计划弹窗，创建模态框并渲染任务列表。
     * @returns {Promise<void>} 弹窗渲染完成后不返回值。
     */
    async show() {
        if (this.modal) {
            this.close();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'tp-modal';
        this.modal.innerHTML = this.renderModal();
        document.body.appendChild(this.modal);

        this.bindEvents();
        await this.loadTasksData(true);
        this.renderAll();

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    /**
     * 关闭时间计划弹窗。
     * @returns {void} 该方法不返回值。
     */
    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * 渲染弹窗 HTML 结构，包含两人身份区、任务列表和添加任务表单。
     * @returns {string} 返回弹窗 HTML 字符串。
     */
    renderModal() {
        return `
            <div class="tp-container">
                <div class="tp-header">
                    <h3>⏰ 时间计划</h3>
                    <button class="tp-close" onclick="timePlanner.close()">✕</button>
                </div>
                <div class="tp-body" id="tp-body">
                    ${UIUtils.getLoadingView()}
                </div>
                <div class="tp-footer">
                    <div class="tp-author-select">
                        <div class="tp-author-item selected" data-author="境" onclick="timePlanner.selectAuthor('境')">🌿 境</div>
                        <div class="tp-author-item" data-author="扬" onclick="timePlanner.selectAuthor('扬')">🌙 扬</div>
                    </div>
                    <div class="tp-input-row">
                        <input type="text" id="tp-task-input" class="tp-input" placeholder="任务名称..." maxlength="80" />
                        <input type="date" id="tp-deadline-input" class="tp-date-input" />
                        <button class="tp-add-btn" id="tp-add-btn" onclick="timePlanner.addTask()">添加</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定弹窗内的事件，包括回车添加任务和输入框交互。
     * @returns {void} 该方法不返回值。
     */
    bindEvents() {
        const input = document.getElementById('tp-task-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.addTask();
                }
            });
        }
        const dateInput = document.getElementById('tp-deadline-input');
        if (dateInput) {
            dateInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTask();
                }
            });
        }
    }

    /**
     * 选择任务归属人，切换选中状态。
     * @param {string} author 归属人名称，'境' 或 '扬'。
     * @returns {void} 该方法不返回值。
     */
    selectAuthor(author) {
        document.querySelectorAll('.tp-author-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.author === author);
        });
    }

    /**
     * 添加新任务，从输入框获取任务名称和截止日期，插入到 Supabase 或本地存储。
     * @returns {Promise<void>} 添加完成后刷新列表。
     */
    async addTask() {
        const author = document.querySelector('.tp-author-item.selected')?.dataset.author || '境';
        const content = document.getElementById('tp-task-input')?.value?.trim();
        const deadline = document.getElementById('tp-deadline-input')?.value;

        if (!content) {
            alert('请输入任务名称');
            return;
        }
        if (!deadline) {
            alert('请选择截止日期');
            return;
        }

        const addBtn = document.getElementById('tp-add-btn');
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = '...';
        }

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.timePlansTable)
                    .insert([{
                        content: content,
                        deadline: deadline,
                        created_by: author,
                        completed: false
                    }]);

                if (error) throw error;

                CacheManager.remove('time_plans_cache');
                await this.loadTasksData(true);
                this.renderAll();

                document.getElementById('tp-task-input').value = '';
                document.getElementById('tp-deadline-input').value = '';

                if (addBtn) {
                    addBtn.textContent = '✓';
                    addBtn.style.background = '#4CAF50';
                    setTimeout(() => {
                        if (addBtn) {
                            addBtn.disabled = false;
                            addBtn.textContent = '添加';
                            addBtn.style.background = '';
                        }
                    }, 800);
                }
                return;
            } catch (error) {
                console.error('TimePlanner: 添加失败:', error);
                alert('添加失败，请重试');
            }
        } else {
            const task = {
                id: `tp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                content,
                deadline,
                createdBy: author,
                completed: false,
                completedBy: null,
                completedAt: null,
                createdAt: new Date().toISOString()
            };
            this.tasksData.push(task);
            this.saveTasksToLocal();
            this.renderAll();

            document.getElementById('tp-task-input').value = '';
            document.getElementById('tp-deadline-input').value = '';

            if (addBtn) {
                addBtn.textContent = '✓';
                addBtn.style.background = '#4CAF50';
                setTimeout(() => {
                    if (addBtn) {
                        addBtn.disabled = false;
                        addBtn.textContent = '添加';
                        addBtn.style.background = '';
                    }
                }, 800);
            }
            return;
        }

        if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = '添加';
        }
    }

    /**
     * 切换任务完成状态，未完成标记为完成，已完成恢复为未完成。
     * @param {string} id 任务 ID。
     * @returns {Promise<void>} 切换完成后刷新列表。
     */
    async toggleTask(id) {
        const task = this.tasksData.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;
        const author = document.querySelector('.tp-author-item.selected')?.dataset.author || '境';

        if (this.supabase) {
            try {
                const updates = {
                    completed: newCompleted,
                    completed_by: newCompleted ? author : null,
                    completed_at: newCompleted ? new Date().toISOString() : null
                };
                const { error } = await this.supabase
                    .from(CONFIG.supabase.timePlansTable)
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('time_plans_cache');
                await this.loadTasksData(true);
                this.renderAll();
            } catch (error) {
                console.error('TimePlanner: 切换状态失败:', error);
                alert('操作失败，请重试');
            }
        } else {
            task.completed = newCompleted;
            task.completedBy = newCompleted ? author : null;
            task.completedAt = newCompleted ? new Date().toISOString() : null;
            this.saveTasksToLocal();
            this.renderAll();
        }
    }

    /**
     * 删除指定任务。
     * @param {string} id 任务 ID。
     * @returns {Promise<void>} 删除完成后刷新列表。
     */
    async deleteTask(id) {
        if (!confirm('确定删除这个任务吗？')) return;

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.timePlansTable)
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('time_plans_cache');
                await this.loadTasksData(true);
                this.renderAll();
            } catch (error) {
                console.error('TimePlanner: 删除失败:', error);
                alert('删除失败，请重试');
            }
        } else {
            this.tasksData = this.tasksData.filter(t => t.id !== id);
            this.saveTasksToLocal();
            this.renderAll();
        }
    }

    /**
     * 进入任务编辑模式，将任务名称和截止日期填入底部输入框。
     * @param {string} id 任务 ID。
     * @returns {void} 该方法不返回值。
     */
    editTask(id) {
        const task = this.tasksData.find(t => t.id === id);
        if (!task) return;

        const input = document.getElementById('tp-task-input');
        const dateInput = document.getElementById('tp-deadline-input');
        const addBtn = document.getElementById('tp-add-btn');

        if (input) input.value = task.content;
        if (dateInput) dateInput.value = task.deadline;
        if (addBtn) {
            addBtn.textContent = '保存';
            addBtn.onclick = () => this.saveEdit(id);
        }

        this.selectAuthor(task.createdBy);
        if (input) input.focus();
    }

    /**
     * 保存编辑后的任务内容。
     * @param {string} id 任务 ID。
     * @returns {Promise<void>} 保存完成后恢复添加按钮并刷新列表。
     */
    async saveEdit(id) {
        const content = document.getElementById('tp-task-input')?.value?.trim();
        const deadline = document.getElementById('tp-deadline-input')?.value;
        const author = document.querySelector('.tp-author-item.selected')?.dataset.author || '境';

        if (!content || !deadline) {
            alert('任务名称和截止日期不能为空');
            return;
        }

        const addBtn = document.getElementById('tp-add-btn');
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = '...';
        }

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.timePlansTable)
                    .update({
                        content: content,
                        deadline: deadline,
                        created_by: author
                    })
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('time_plans_cache');
                await this.loadTasksData(true);
            } catch (error) {
                console.error('TimePlanner: 编辑失败:', error);
                alert('保存失败，请重试');
                if (addBtn) {
                    addBtn.disabled = false;
                    addBtn.textContent = '保存';
                }
                return;
            }
        } else {
            const task = this.tasksData.find(t => t.id === id);
            if (task) {
                task.content = content;
                task.deadline = deadline;
                task.createdBy = author;
                this.saveTasksToLocal();
            }
        }

        if (addBtn) {
            addBtn.textContent = '添加';
            addBtn.onclick = () => this.addTask();
            addBtn.disabled = false;
        }
        document.getElementById('tp-task-input').value = '';
        document.getElementById('tp-deadline-input').value = '';
        this.renderAll();
    }

    /**
     * 渲染整个弹窗内容，包括统计区和任务列表。
     * @returns {void} 该方法不返回值。
     */
    renderAll() {
        const body = document.getElementById('tp-body');
        if (!body) return;

        const jingTasks = this.tasksData.filter(t => t.createdBy === '境');
        const yangTasks = this.tasksData.filter(t => t.createdBy === '扬');

        body.innerHTML = `
            <div class="tp-stats">
                ${this.renderPersonCard('境', '🌿', jingTasks)}
                ${this.renderPersonCard('扬', '🌙', yangTasks)}
            </div>
            <div class="tp-list" id="tp-list">
                ${this.renderTaskList()}
            </div>
        `;
    }

    /**
     * 渲染单人统计卡片，显示任务总数、已完成数和即将到期数。
     * @param {string} name 归属人名称。
     * @param {string} emoji 装饰表情。
     * @param {Array<Object>} tasks 该人的任务数组。
     * @returns {string} 返回统计卡片 HTML。
     */
    renderPersonCard(name, emoji, tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const overdue = tasks.filter(t => !t.completed && this.getDaysUntilDeadline(t.deadline) < 0).length;
        const soon = tasks.filter(t => {
            const days = this.getDaysUntilDeadline(t.deadline);
            return !t.completed && days >= 0 && days <= 3;
        }).length;

        return `
            <div class="tp-person-card ${name === '境' ? 'tp-jing' : 'tp-yang'}">
                <div class="tp-person-header">
                    <span class="tp-person-emoji">${emoji}</span>
                    <span class="tp-person-name">${name}</span>
                </div>
                <div class="tp-person-stats">
                    <div class="tp-stat">
                        <span class="tp-stat-num">${total}</span>
                        <span class="tp-stat-label">总计</span>
                    </div>
                    <div class="tp-stat">
                        <span class="tp-stat-num tp-stat-done">${completed}</span>
                        <span class="tp-stat-label">已完成</span>
                    </div>
                    <div class="tp-stat">
                        <span class="tp-stat-num tp-stat-pending">${pending}</span>
                        <span class="tp-stat-label">待完成</span>
                    </div>
                </div>
                ${overdue > 0 ? `<div class="tp-person-warn tp-overdue">⚠️ ${overdue} 个已过期</div>` : ''}
                ${soon > 0 ? `<div class="tp-person-warn tp-soon">⏰ ${soon} 个即将到期</div>` : ''}
            </div>
        `;
    }

    /**
     * 渲染任务列表，按归属人分组，按截止日期排序，未完成在前。
     * @returns {string} 返回任务列表 HTML。
     */
    renderTaskList() {
        if (this.tasksData.length === 0) {
            return '<div class="tp-empty">还没有任务，添加第一个吧</div>';
        }

        const sorted = [...this.tasksData].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });

        return sorted.map(task => this.renderTaskItem(task)).join('');
    }

    /**
     * 渲染单条任务项，包含状态、名称、截止日期、剩余天数和操作按钮。
     * @param {Object} task 任务数据对象。
     * @returns {string} 返回任务项 HTML。
     */
    renderTaskItem(task) {
        const days = this.getDaysUntilDeadline(task.deadline);
        const isOverdue = !task.completed && days < 0;
        const isSoon = !task.completed && days >= 0 && days <= 3;
        const isNear = !task.completed && days > 3 && days <= 7;

        const urgencyClass = isOverdue ? 'tp-task-overdue' : isSoon ? 'tp-task-soon' : isNear ? 'tp-task-near' : '';
        const userClass = task.createdBy === '境' ? 'tp-task-jing' : 'tp-task-yang';

        const deadlineText = this.formatDeadline(task.deadline, days, task.completed);

        return `
            <div class="tp-task ${urgencyClass} ${task.completed ? 'tp-task-done' : ''} ${userClass}">
                <div class="tp-task-check" onclick="timePlanner.toggleTask('${task.id}')">
                    ${task.completed ? '✓' : '○'}
                </div>
                <div class="tp-task-content">
                    <div class="tp-task-name ${task.completed ? 'tp-task-name-done' : ''}">${this.escapeHtml(task.content)}</div>
                    <div class="tp-task-meta">
                        <span class="tp-task-author">${task.createdBy === '境' ? '🌿' : '🌙'} ${task.createdBy}</span>
                        <span class="tp-task-deadline">${deadlineText}</span>
                        ${task.completed && task.completedBy ? `<span class="tp-task-completed-by">由 ${task.completedBy} 完成</span>` : ''}
                    </div>
                </div>
                <div class="tp-task-actions">
                    <button class="tp-task-btn tp-edit-btn" onclick="timePlanner.editTask('${task.id}')">✏️</button>
                    <button class="tp-task-btn tp-delete-btn" onclick="timePlanner.deleteTask('${task.id}')">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * 计算从今天到截止日期的剩余天数，截止日期当天算 0 天。
     * @param {string} deadline 截止日期字符串，格式 YYYY-MM-DD。
     * @returns {number} 返回剩余天数，已过期返回负数。
     */
    getDaysUntilDeadline(deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(deadline);
        due.setHours(0, 0, 0, 0);
        return Math.round((due - today) / (1000 * 60 * 60 * 24));
    }

    /**
     * 格式化截止日期显示文本，包含日期和剩余天数提示。
     * @param {string} deadline 截止日期字符串。
     * @param {number} days 剩余天数。
     * @param {boolean} completed 是否已完成。
     * @returns {string} 返回格式化后的截止日期文本。
     */
    formatDeadline(deadline, days, completed) {
        const date = new Date(deadline);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;

        if (completed) return `📅 ${dateStr}`;

        if (days < 0) return `📅 ${dateStr} · 已过期 ${Math.abs(days)} 天`;
        if (days === 0) return `📅 ${dateStr} · 今天截止`;
        if (days === 1) return `📅 ${dateStr} · 明天截止`;
        if (days <= 3) return `📅 ${dateStr} · 还剩 ${days} 天`;
        if (days <= 7) return `📅 ${dateStr} · ${days} 天后`;
        return `📅 ${dateStr}`;
    }

    /**
     * 转义 HTML 特殊字符，防止任务内容中的 HTML 标签被解析。
     * @param {string} text 需要转义的文本。
     * @returns {string} 返回转义后的安全文本。
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
}

const timePlanner = new TimePlanner();
