// --- 配置中心 (只改这里) ---
const CONFIG = {
    passcode: atob("MDEyMQ=="),           
    startDate: "2026-01-21",    
    loveLetter: "我不擅长写情话，<br>但我只想把你和我的每一天，<br>都按一次 Ctrl+S（保存）。<br><br>Forever Love. ❤️",
    specialDates: [
        { date: "2026-01-21", title: "💕 我们在一起", type: "start" },
        { date: "2026-02-14", title: "💝 情人节", type: "holiday" },
        { date: "2026-05-20", title: "❤️ 520", type: "special" },
        { date: "2026-12-25", title: "🎄 圣诞节", type: "holiday" }
    ],
    monthlyAnniversary: 21,
    events: [
        { date: "2026-02-25", title: "第一次约会" }
    ]
};

// --- DOM 元素获取 (解耦逻辑) ---
const els = {
    passcode: document.getElementById('passcode'),
    loginPage: document.getElementById('page-login'),
    homePage: document.getElementById('page-home'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    daysCount: document.getElementById('days-count'),
    typewriter: document.getElementById('typewriter-text'),
    headerTitle: document.getElementById('header-title'),
    bottomNav: document.getElementById('bottom-nav')
};

// --- 1. 初始化事件监听 ---
document.addEventListener('DOMContentLoaded', () => {
    // 登录按钮
    document.getElementById('btn-unlock').addEventListener('click', checkPass);
    
    // 侧边栏开关
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => toggleSidebar(true));
    els.overlay.addEventListener('click', () => toggleSidebar(false));

    // 侧边栏菜单点击
    document.getElementById('menu-home').addEventListener('click', () => switchView('home'));
    document.getElementById('menu-lab').addEventListener('click', () => switchView('lab'));

    // 底部 Tab 点击 (使用事件委托)
    els.bottomNav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) switchBottomTab(item.dataset.tab, item);
    });
});

// --- 2. 核心功能函数 ---

function checkPass() {
    if (els.passcode.value === CONFIG.passcode) {
        // 登录成功动画
        els.loginPage.classList.remove('active');
        els.loginPage.style.transform = 'translateX(-100%)';
        els.loginPage.style.pointerEvents = 'none';
        
        els.homePage.classList.add('active');
        setTimeout(() => { els.loginPage.style.display = 'none'; }, 500);

        // 启动特效
        startTimer();
        startTypewriter();
    } else {
        alert("密码不对哦！😤");
        els.passcode.value = "";
    }
}

function toggleSidebar(show) {
    if (show) {
        els.sidebar.classList.add('open');
        els.overlay.classList.add('open');
    } else {
        els.sidebar.classList.remove('open');
        els.overlay.classList.remove('open');
    }
}

// 切换顶级视图 (首页 / 实验室)
function switchView(viewName) {
    toggleSidebar(false); // 关闭侧边栏
    
    // 隐藏所有视图
    document.querySelectorAll('.content-view').forEach(el => el.style.display = 'none');
    document.getElementById('view-' + viewName).style.display = 'block';

    // 更新菜单高亮
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active-menu'));
    document.getElementById('menu-' + viewName).classList.add('active-menu');

    // UI 调整
    if (viewName === 'home') {
        els.bottomNav.style.display = 'flex';
        els.headerTitle.innerText = "For You";
    } else {
        els.bottomNav.style.display = 'none';
        els.headerTitle.innerText = viewName === 'lab' ? "实验室" : "新功能";
    }
}

// 切换底部 Tab (回忆 / 情书)
function switchBottomTab(tabName, element) {
    // 更新样式
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active-tab'));
    element.classList.add('active-tab');

    // 更新内容
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active-content'));
    document.getElementById('tab-' + tabName).classList.add('active-content');
}

// --- 3. 特效逻辑 ---

function startTimer() {
    const start = new Date(CONFIG.startDate);
    const now = new Date();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    let count = 0;
    if(days <= 0) { els.daysCount.innerText = 0; return; }
    
    const timer = setInterval(() => {
        count += Math.ceil(days / 30);
        if(count >= days) { count = days; clearInterval(timer); }
        els.daysCount.innerText = count;
    }, 30);
}

let charIndex = 0;
function startTypewriter() {
    const text = CONFIG.loveLetter;
    if (charIndex < text.length) {
        if (text.substring(charIndex).startsWith('<br>')) {
            els.typewriter.innerHTML += '<br>';
            charIndex += 4;
        } else {
            els.typewriter.innerHTML += text.charAt(charIndex);
            charIndex++;
        }
        setTimeout(startTypewriter, 100);
    }
}

class CoupleCalendar {
    constructor() {
        this.currentDate = new Date();
        this.container = null;
    }
    
    show() {
        const calendarHTML = this.render();
        
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
        
        for (let i = 0; i < startDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
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
        
        const startDate = new Date(CONFIG.startDate);
        const currentDate = new Date(dateStr);
        const days = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        
        let html = `
            <div class="date-detail-modal">
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
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);
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

const calendar = new CoupleCalendar();

class DiceGame {
    constructor() {
        this.rolling = false;
        this.diceValues = [1, 2, 3, 4, 5, 6];
        this.diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    }
    
    roll() {
        if (this.rolling) return;
        
        this.rolling = true;
        
        const modal = document.createElement('div');
        modal.className = 'dice-modal';
        modal.innerHTML = `
            <div class="dice-content">
                <div class="dice-header">
                    <h3>🎲 掷骰子</h3>
                    <button onclick="this.closest('.dice-modal').remove()">✕</button>
                </div>
                <div class="dice-body">
                    <div class="dice-display">
                        <div class="dice-result" id="dice-result">🎲</div>
                    </div>
                    <div class="dice-info">
                        <p class="dice-hint">点击按钮开始掷骰子</p>
                    </div>
                    <button class="dice-roll-btn" id="dice-roll-btn">🎯 掷骰子</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const rollBtn = document.getElementById('dice-roll-btn');
        rollBtn.addEventListener('click', () => this.startRolling());
    }
    
    startRolling() {
        if (!this.rolling) return;
        
        const diceResult = document.getElementById('dice-result');
        const rollBtn = document.getElementById('dice-roll-btn');
        const hint = document.querySelector('.dice-hint');
        
        rollBtn.disabled = true;
        rollBtn.textContent = '🎲 掷骰子中...';
        hint.textContent = '骰子正在旋转...';
        
        let count = 0;
        const maxCount = 15;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * 6);
            diceResult.textContent = this.diceEmojis[randomIndex];
            diceResult.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                this.finalRoll();
            }
        }, 100);
    }
    
    finalRoll() {
        const diceResult = document.getElementById('dice-result');
        const rollBtn = document.getElementById('dice-roll-btn');
        const hint = document.querySelector('.dice-hint');
        
        const result = Math.floor(Math.random() * 6) + 1;
        diceResult.textContent = this.diceEmojis[result - 1];
        diceResult.style.transform = 'rotate(0deg)';
        
        rollBtn.disabled = false;
        rollBtn.textContent = '🎯 再掷一次';
        hint.innerHTML = `结果是：<span class="dice-result-number">${result}</span> 点`;
        
        this.rolling = false;
        
        diceResult.style.animation = 'diceBounce 0.5s ease-out';
        setTimeout(() => {
            diceResult.style.animation = '';
        }, 500);
    }
}

const diceGame = new DiceGame();