// --- 配置中心 (只改这里) ---
const CONFIG = {
    passcode: "0121",           // 你的密码
    startDate: "2026-01-21",    // 你们的纪念日
    // 你的情书 (支持 HTML)
    loveLetter: "亲爱的：<br><br>这是我为你写的代码。<br>变量是我，常量是你。<br>循环是日复一日的喜欢。<br><br>Forever Love. ❤️"
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