class HomeFeature {
    constructor() {
        this.charIndex = 0;
    }

    startTimer() {
        const start = new Date(CONFIG.startDate);
        const now = new Date();
        const days = calculateDaysBetween(start, now);
        
        let count = 0;
        if(days <= 0) { 
            els.daysCount.innerText = 0; 
            return; 
        }
        
        const timer = setInterval(() => {
            count += Math.ceil(days / 30);
            if(count >= days) { 
                count = days; 
                clearInterval(timer); 
            }
            els.daysCount.innerText = count;
        }, 30);
    }

    startTypewriter() {
        const text = CONFIG.loveLetter;
        if (this.charIndex < text.length) {
            if (text.substring(this.charIndex).startsWith('<br>')) {
                els.typewriter.innerHTML += '<br>';
                this.charIndex += 4;
            } else {
                els.typewriter.innerHTML += text.charAt(this.charIndex);
                this.charIndex++;
            }
            setTimeout(() => this.startTypewriter(), 100);
        }
    }

    toggleSidebar(show) {
        if (show) {
            els.sidebar.classList.add('open');
            els.overlay.classList.add('open');
        } else {
            els.sidebar.classList.remove('open');
            els.overlay.classList.remove('open');
        }
    }

    switchView(viewName) {
        this.toggleSidebar(false);
        
        document.querySelectorAll('.content-view').forEach(el => el.style.display = 'none');
        document.getElementById('view-' + viewName).style.display = 'block';

        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active-menu'));
        document.getElementById('menu-' + viewName).classList.add('active-menu');

        if (viewName === 'home') {
            els.bottomNav.style.display = 'flex';
            els.headerTitle.innerText = "For You";
        } else if (viewName === 'lab') {
            els.bottomNav.style.display = 'none';
            els.headerTitle.innerText = "百宝库";
        } else if (viewName === 'calendar') {
            els.bottomNav.style.display = 'none';
            els.headerTitle.innerText = "📅 日历";
            calendar.renderCalendarView();
        }
    }

    switchBottomTab(tabName, tabElement) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active-tab'));
        tabElement.classList.add('active-tab');

        document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active-content'));
        document.getElementById('tab-' + tabName).classList.add('active-content');
    }
}

const homeFeature = new HomeFeature();
