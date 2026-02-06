# 日历功能完善方案

## 当前状态分析

### 现有功能
- ❌ 日历只是一个占位按钮，点击无响应
- ❌ 没有日历UI界面
- ❌ 没有任何日历功能

### 需要实现的功能
- ✅ 完整的日历UI界面
- ✅ 月份切换功能
- ✅ 标记重要日期（纪念日、特殊日子）
- ✅ 显示当前日期
- ✅ 与情侣主题结合（显示恋爱天数等）

---

## 功能设计方案

### 方案一：基础日历（快速实现）

#### 功能特点
- 显示当前月份日历
- 切换上/下月
- 高亮今天
- 简单的UI设计

#### 实现难度
- ⭐⭐ 简单
- 预计时间：1-2小时

#### 代码结构

```javascript
// 日历功能
function showCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    renderCalendar(year, month);
}

function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // 生成日历HTML
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">◀</button>
            <span>${year}年${month + 1}月</span>
            <button onclick="changeMonth(1)">▶</button>
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
    
    // 空白日期
    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // 日期
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isSameDay(new Date(year, month, day), new Date());
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>`;
    }
    
    html += '</div>';
    
    return html;
}
```

#### CSS样式

```css
.calendar-container {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.calendar-header button {
    background: var(--primary-color);
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

.calendar-day-header {
    text-align: center;
    font-weight: bold;
    color: #666;
    font-size: 12px;
    padding: 5px;
}

.calendar-day {
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
}

.calendar-day:hover {
    background: #f0f0f0;
}

.calendar-day.today {
    background: var(--primary-color);
    color: white;
    font-weight: bold;
}

.calendar-day.empty {
    cursor: default;
}
```

---

### 方案二：情侣主题日历（推荐）

#### 功能特点
- 显示恋爱天数
- 标记重要纪念日
- 显示特殊日期（如每月纪念日）
- 添加事件提醒
- 美观的情侣主题设计

#### 实现难度
- ⭐⭐⭐ 中等
- 预计时间：3-4小时

#### 配置中心扩展

```javascript
const CONFIG = {
    passcode: atob("MDEyMQ=="),
    startDate: "2026-01-21",
    loveLetter: "我不擅长写情话，<br>但我只想把你和我的每一天，<br>都按一次 Ctrl+S（保存）。<br><br>Forever Love. ❤️",
    
    // 日历配置
    specialDates: [
        { date: "2026-01-21", title: "💕 我们在一起", type: "start" },
        { date: "2026-02-14", title: "💝 情人节", type: "holiday" },
        { date: "2026-05-20", title: "❤️ 520", type: "special" },
        { date: "2026-12-25", title: "🎄 圣诞节", type: "holiday" }
    ],
    
    // 每月纪念日
    monthlyAnniversary: 21, // 每月21号
    
    // 自定义事件
    events: [
        { date: "2026-02-01", title: "第一次约会" },
        { date: "2026-02-14", title: "一起看电影" }
    ]
};
```

#### 完整日历功能

```javascript
class CoupleCalendar {
    constructor() {
        this.currentDate = new Date();
        this.container = null;
    }
    
    show() {
        const calendarHTML = this.render();
        
        // 创建日历弹窗
        const modal = document.createElement('div');
        modal.className = 'calendar-modal';
        modal.innerHTML = `
            <div class="calendar-modal-content">
                <div class="calendar-modal-header">
                    <h3>📅 我们的日历</h3>
                    <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                </div>
                ${calendarHTML}
                <div class="calendar-events">
                    <h4>📌 重要日期</h4>
                    ${this.renderSpecialDates()}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        
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
        
        // 空白日期
        for (let i = 0; i < startDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // 日期
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            
            const isToday = this.isSameDay(date, new Date());
            const isSpecial = this.isSpecialDate(dateStr);
            const isAnniversary = day === CONFIG.monthlyAnniversary;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSpecial) classes += ' special';
            if (isAnniversary) classes += ' anniversary';
            
            html += `<div class="${classes}" onclick="calendar.showDateDetails('${dateStr}')">${day}</div>`;
        }
        
        html += '</div>';
        
        return html;
    }
    
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.updateCalendar();
    }
    
    updateCalendar() {
        const calendarContent = document.querySelector('.calendar-modal-content');
        if (calendarContent) {
            const newCalendar = this.render();
            calendarContent.innerHTML = `
                <div class="calendar-modal-header">
                    <h3>📅 我们的日历</h3>
                    <button onclick="this.closest('.calendar-modal').remove()">✕</button>
                </div>
                ${newCalendar}
                <div class="calendar-events">
                    <h4>📌 重要日期</h4>
                    ${this.renderSpecialDates()}
                </div>
            `;
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
    
    showDateDetails(dateStr) {
        const specialDate = CONFIG.specialDates.find(d => d.date === dateStr);
        const event = CONFIG.events.find(e => e.date === dateStr);
        
        let message = `📅 ${dateStr}`;
        
        if (specialDate) {
            message += `\n\n${specialDate.title}`;
        }
        
        if (event) {
            message += `\n\n${event.title}`;
        }
        
        // 计算恋爱天数
        const startDate = new Date(CONFIG.startDate);
        const currentDate = new Date(dateStr);
        const days = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
            message += `\n\n💕 恋爱第 ${days} 天`;
        }
        
        alert(message);
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    isSpecialDate(dateStr) {
        return CONFIG.specialDates.some(d => d.date === dateStr);
    }
}

// 创建全局日历实例
const calendar = new CoupleCalendar();
```

#### CSS样式扩展

```css
/* 日历弹窗 */
.calendar-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.calendar-modal-content {
    background: white;
    border-radius: 20px;
    padding: 25px;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s;
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.calendar-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.calendar-modal-header h3 {
    margin: 0;
    color: var(--primary-color);
}

.calendar-modal-header button {
    background: #f0f0f0;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
}

/* 特殊日期样式 */
.calendar-day.special {
    background: #ffeaa7;
    color: #d35400;
    font-weight: bold;
}

.calendar-day.anniversary {
    background: #ff7675;
    color: white;
    font-weight: bold;
}

/* 事件列表 */
.calendar-events {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px dashed #eee;
}

.calendar-events h4 {
    margin: 0 0 15px 0;
    color: #666;
}

.special-dates-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.special-date-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 10px;
}

.special-date-title {
    font-weight: 500;
    color: #2d3436;
}

.special-date-date {
    font-size: 12px;
    color: #b2bec3;
}
```

---

### 方案三：高级日历（完整功能）

#### 功能特点
- 所有方案二的功能
- 添加/编辑/删除事件
- 事件提醒通知
- 数据持久化（localStorage）
- 导出日历
- 分享日历

#### 实现难度
- ⭐⭐⭐⭐ 较难
- 预计时间：1-2天

#### 额外功能

```javascript
// 事件管理
class EventManager {
    constructor() {
        this.events = this.loadEvents();
    }
    
    addEvent(date, title, type = 'normal') {
        const event = {
            id: Date.now(),
            date: date,
            title: title,
            type: type,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(event);
        this.saveEvents();
        return event;
    }
    
    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
    }
    
    updateEvent(id, updates) {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...updates };
            this.saveEvents();
        }
    }
    
    getEvents(date) {
        return this.events.filter(e => e.date === date);
    }
    
    saveEvents() {
        localStorage.setItem('coupleCalendarEvents', JSON.stringify(this.events));
    }
    
    loadEvents() {
        const saved = localStorage.getItem('coupleCalendarEvents');
        return saved ? JSON.parse(saved) : [];
    }
}

// 通知提醒
class NotificationManager {
    checkReminders() {
        const today = this.formatDate(new Date());
        const events = eventManager.getEvents(today);
        
        events.forEach(event => {
            if (event.type === 'reminder') {
                this.showNotification(event.title);
            }
        });
    }
    
    showNotification(title) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('💕 日历提醒', { body: title });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('💕 日历提醒', { body: title });
                    }
                });
            }
        }
    }
}

// 导出功能
function exportCalendar() {
    const data = {
        specialDates: CONFIG.specialDates,
        events: eventManager.events,
        startDate: CONFIG.startDate
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'couple-calendar.json';
    a.click();
    
    URL.revokeObjectURL(url);
}
```

---

## 实施建议

### 第一阶段（立即实施）
**选择方案二：情侣主题日历**

**理由：**
- 功能完整，满足情侣需求
- 实现难度适中
- 用户体验好
- 与现有主题契合度高

**实施步骤：**

1. **修改HTML**
   - 将日历按钮添加点击事件
   - 创建日历弹窗容器

2. **添加JavaScript**
   - 实现CoupleCalendar类
   - 添加日期计算逻辑
   - 实现特殊日期标记

3. **扩展CSS**
   - 添加日历弹窗样式
   - 美化日历UI
   - 添加动画效果

4. **配置数据**
   - 在CONFIG中添加specialDates
   - 设置monthlyAnniversary

### 第二阶段（后续优化）

1. **添加事件管理功能**
   - 添加/编辑/删除事件
   - 数据持久化

2. **添加提醒功能**
   - 浏览器通知
   - 提前提醒

3. **优化UI**
   - 更美观的设计
   - 更好的交互体验

4. **添加导出功能**
   - 导出为图片
   - 导出为JSON

---

## 代码集成方案

### 修改 index.html

```html
<!-- 将日历按钮改为 -->
<div class="lab-item" onclick="calendar.show()">📅 日历</div>
```

### 修改 script.js

在文件末尾添加：

```javascript
// 日历功能
class CoupleCalendar {
    // [方案二的完整代码]
}

const calendar = new CoupleCalendar();
```

### 修改 style.css

在文件末尾添加：

```css
/* 日历弹窗样式 */
.calendar-modal {
    /* [方案二的完整CSS代码]
}
```

---

## 预期效果

### 用户体验
- ✅ 点击日历按钮，弹出美观的日历界面
- ✅ 可以切换月份查看不同日期
- ✅ 特殊日期有明显的标记
- ✅ 点击日期可以查看详细信息
- ✅ 显示恋爱天数等情侣专属信息

### 功能完整性
- ✅ 基础日历功能完整
- ✅ 情侣主题特色突出
- ✅ 易于扩展和维护

---

## 总结

| 方案 | 功能完整度 | 实现难度 | 推荐度 |
|------|-----------|---------|--------|
| 方案一：基础日历 | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| 方案二：情侣主题 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 方案三：高级日历 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**最终推荐：方案二 - 情侣主题日历**

这个方案在功能完整度和实现难度之间取得了很好的平衡，非常适合您的情侣纪念网站。
