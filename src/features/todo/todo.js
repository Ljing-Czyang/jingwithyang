class TodoList {
    constructor() {
        this.modal = null;
        this.todosData = [];
        this.supabase = null;
        this.initSupabase();
        this.prefetch();
    }

    /**
     * 初始化 Supabase 客户端
     * 从全局 getSupabaseClient 获取已配置的客户端实例
     */
    initSupabase() {
        try {
            this.supabase = getSupabaseClient();
        } catch (error) {
            console.error('TodoList: 初始化 Supabase 失败:', error);
        }
    }

    /**
     * 预加载待办数据
     * 优先从本地缓存读取，同时异步从 Supabase 拉取最新数据
     */
    prefetch() {
        const cached = DataUtils.loadCachedList('todos_cache', []);
        if (cached.length > 0) {
            this.todosData = cached;
        }
        if (this.supabase) {
            this.loadTodosData(true);
        }
    }

    /**
     * 从 Supabase 加载待办数据
     * @param {boolean} forceRefresh - 是否强制刷新，跳过缓存
     * @returns {Promise<Array>} 待办数据数组
     */
    async loadTodosData(forceRefresh) {
        this.todosData = await DataUtils.loadSupabaseList({
            currentData: this.todosData,
            forceRefresh: forceRefresh,
            supabase: this.supabase,
            cacheKey: 'todos_cache',
            tableName: CONFIG.supabase.todosTable,
            orderColumn: 'created_at',
            ascending: false,
            logLabel: 'TodoList',
            mapItem: t => ({
                id: t.id,
                content: t.content,
                createdBy: t.created_by,
                completed: t.completed || false,
                completedBy: t.completed_by || null,
                completedAt: t.completed_at || null,
                createdAt: t.created_at
            })
        });
        return this.todosData;
    }

    /**
     * 显示待办弹窗
     * 创建模态框并渲染待办列表内容
     */
    async show() {
        if (this.modal) {
            this.close();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'todo-modal';
        this.modal.innerHTML = `
            <div class="todo-container">
                <div class="todo-header">
                    <h3>📋 愿望清单</h3>
                    <button class="todo-close" onclick="todoList.close()">✕</button>
                </div>

                <div class="todo-progress" id="todoProgress"></div>

                <div class="todo-input-area">
                    <div class="todo-author-select">
                        <div class="todo-author-item selected" data-author="境" onclick="todoList.selectAuthor('境')">🌿 境</div>
                        <div class="todo-author-item" data-author="扬" onclick="todoList.selectAuthor('扬')">🌙 扬</div>
                    </div>
                    <div class="todo-input-row">
                        <input type="text" id="todoInput" class="todo-input" placeholder="想一起做的事..." maxlength="100" />
                        <button class="todo-add-btn" id="todoAddBtn" onclick="todoList.addTodo()">添加</button>
                    </div>
                </div>

                <div class="todo-list" id="todoList"></div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.renderList();
        await this.loadTodosData(true);
        this.renderList();

        const input = document.getElementById('todoInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.addTodo();
                }
            });
        }

        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    /**
     * 选择待办创建人
     * @param {string} author - 创建人名称（'境' 或 '扬'）
     */
    selectAuthor(author) {
        document.querySelectorAll('.todo-author-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.author === author);
        });
    }

    /**
     * 添加新的待办项
     * 从输入框获取内容，选择创建人，插入到 Supabase 并刷新列表
     */
    async addTodo() {
        const author = document.querySelector('.todo-author-item.selected')?.dataset.author || '境';
        const content = document.getElementById('todoInput')?.value?.trim();

        if (!content) return;

        const addBtn = document.getElementById('todoAddBtn');
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = '...';
        }

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.todosTable)
                    .insert([{
                        content: content,
                        created_by: author,
                        completed: false
                    }]);

                if (error) throw error;

                CacheManager.remove('todos_cache');
                await this.loadTodosData(true);
                this.renderList();

                const input = document.getElementById('todoInput');
                if (input) input.value = '';

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
                console.error('TodoList: 添加失败:', error);
                alert('添加失败，请重试');
            }
        } else {
            alert('未连接 Supabase，无法添加');
        }

        if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = '添加';
        }
    }

    /**
     * 切换待办项的完成状态
     * @param {string} id - 待办项的 UUID
     */
    async toggleTodo(id) {
        const todo = this.todosData.find(t => t.id === id);
        if (!todo) return;

        const newCompleted = !todo.completed;
        const author = document.querySelector('.todo-author-item.selected')?.dataset.author || '境';

        if (this.supabase) {
            try {
                const updateData = {
                    completed: newCompleted,
                    completed_by: newCompleted ? author : null,
                    completed_at: newCompleted ? new Date().toISOString() : null
                };

                const { error } = await this.supabase
                    .from(CONFIG.supabase.todosTable)
                    .update(updateData)
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('todos_cache');
                await this.loadTodosData(true);
                this.renderList();
            } catch (error) {
                console.error('TodoList: 切换状态失败:', error);
                alert('操作失败，请重试');
            }
        }
    }

    /**
     * 删除待办项
     * @param {string} id - 待办项的 UUID
     */
    async deleteTodo(id) {
        if (!confirm('确定删除这条待办吗？')) return;

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from(CONFIG.supabase.todosTable)
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                CacheManager.remove('todos_cache');
                await this.loadTodosData(true);
                this.renderList();
            } catch (error) {
                console.error('TodoList: 删除失败:', error);
                alert('删除失败');
            }
        }
    }

    /**
     * 格式化时间为友好显示
     * @param {string} dateStr - ISO 日期字符串
     * @returns {string} 格式化后的时间文本
     */
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

        if (y === now.getFullYear()) {
            return `${m}.${d}`;
        }
        return `${y}.${m}.${d}`;
    }

    /**
     * 渲染进度条和待办列表
     * 未完成的排在前面，已完成的排在后面并显示灰色划线样式
     */
    renderList() {
        const listEl = document.getElementById('todoList');
        const progressEl = document.getElementById('todoProgress');
        if (!listEl) return;

        const total = this.todosData.length;
        const completed = this.todosData.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (progressEl) {
            progressEl.innerHTML = `
                <div class="todo-progress-bar">
                    <div class="todo-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="todo-progress-text">${completed}/${total} 已完成 ${total > 0 ? '· ' + percent + '%' : ''}</div>
            `;
        }

        if (total === 0) {
            listEl.innerHTML = `
                <div class="todo-empty">
                    <div class="todo-empty-icon">📋</div>
                    <p>还没有愿望</p>
                    <p class="todo-empty-hint">写下想一起做的事吧</p>
                </div>
            `;
            return;
        }

        const pending = this.todosData.filter(t => !t.completed);
        const done = this.todosData.filter(t => t.completed);

        let html = '';

        if (pending.length > 0) {
            html += `<div class="todo-section-label">待完成 (${pending.length})</div>`;
            html += pending.map(t => this.renderTodoItem(t)).join('');
        }

        if (done.length > 0) {
            html += `<div class="todo-section-label todo-section-done">已完成 (${done.length})</div>`;
            html += done.map(t => this.renderTodoItem(t)).join('');
        }

        listEl.innerHTML = html;
    }

    /**
     * 渲染单条待办项的 HTML
     * @param {Object} todo - 待办数据对象
     * @param {string} todo.id - 待办 ID
     * @param {string} todo.content - 待办内容
     * @param {string} todo.createdBy - 创建人
     * @param {boolean} todo.completed - 是否完成
     * @param {string|null} todo.completedBy - 完成人
     * @param {string|null} todo.completedAt - 完成时间
     * @param {string} todo.createdAt - 创建时间
     * @returns {string} 待办项 HTML 字符串
     */
    renderTodoItem(todo) {
        const isJing = todo.createdBy === '境';
        const completedByJing = todo.completedBy === '境';
        const content = UIUtils.escapeHtml(todo.content);
        const createdBy = UIUtils.escapeHtml(todo.createdBy);
        const createdAt = UIUtils.escapeHtml(this.formatTime(todo.createdAt));
        const completedBy = UIUtils.escapeHtml(todo.completedBy || '');
        const completedAt = todo.completedAt ? UIUtils.escapeHtml(this.formatTime(todo.completedAt)) : '';

        return `
            <div class="todo-item ${todo.completed ? 'todo-done' : ''} ${isJing ? 'todo-jing' : 'todo-yang'}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoList.toggleTodo('${todo.id}')">
                    ${todo.completed ? '✓' : ''}
                </div>
                <div class="todo-body">
                    <div class="todo-content">${content}</div>
                    <div class="todo-meta">
                        <span class="todo-creator">${isJing ? '🌿' : '🌙'} ${createdBy}</span>
                        <span class="todo-time">${createdAt}</span>
                        ${todo.completed && todo.completedBy ? `<span class="todo-completed-info">${completedByJing ? '🌿' : '🌙'} ${completedBy} 完成${completedAt ? ' · ' + completedAt : ''}</span>` : ''}
                    </div>
                </div>
                <button class="todo-delete-btn" onclick="todoList.deleteTodo('${todo.id}')">🗑️</button>
            </div>
        `;
    }

    /**
     * 关闭待办弹窗
     * 移除模态框 DOM 元素并清理引用
     */
    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

const todoList = new TodoList();
