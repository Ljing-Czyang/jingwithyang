class CoupleCalendar {
    constructor() {
        this.currentDate = new Date();
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
            const dateStr = formatDate(date);
            
            const isToday = isSameDay(date, new Date());
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
        const days = calculateDaysBetween(startDate, currentDate);
        
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

    isSpecialDate(dateStr) {
        return CONFIG.specialDates.some(d => d.date === dateStr);
    }
}

const calendar = new CoupleCalendar();
