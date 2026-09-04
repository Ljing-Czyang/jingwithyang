class ShareCard {
    constructor() {
        this.modal = null;
        this.quoteOffset = 0;
        this.avatarImg = null;
    }

    getDays() {
        return Math.max(0, calculateDaysBetween(new Date(CONFIG.startDate), new Date()));
    }

    getQuote() {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        return QUOTES[(dayOfYear + this.quoteOffset) % QUOTES.length].text;
    }

    todayText() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}.${m}.${day}`;
    }

    footerText() {
        const { jing, yang } = CONFIG.users;
        return `${jing.name} ${jing.emoji}  &  ${yang.emoji} ${yang.name}`;
    }

    show() {
        this.close();

        const modal = document.createElement('div');
        modal.className = 'share-card-modal';
        modal.innerHTML = `
            <div class="share-card-content">
                <div class="share-card-header">
                    <h3>💝 分享卡片</h3>
                    <button onclick="shareCard.close()">✕</button>
                </div>
                <div class="share-card-body">
                    <div class="sc-card">
                        <div class="sc-deco sc-deco-1"></div>
                        <div class="sc-deco sc-deco-2"></div>
                        <span class="sc-star sc-star-1">✦</span>
                        <span class="sc-star sc-star-2">✦</span>
                        <img class="sc-avatar" src="avatar.png" alt="境和扬">
                        <p class="sc-label">我们已经相爱</p>
                        <h1 class="sc-days" id="sc-days">${this.getDays()}</h1>
                        <p class="sc-unit">DAYS</p>
                        <div class="sc-divider"><i></i><span>❤</span><i></i></div>
                        <p class="sc-quote" id="sc-quote">${this.getQuote()}</p>
                        <p class="sc-footer">${this.footerText()} · ${this.todayText()}</p>
                    </div>
                    <div class="share-card-actions">
                        <button class="sc-btn sc-btn-secondary" id="sc-next-quote">🔀 换一句</button>
                        <button class="sc-btn sc-btn-primary" id="sc-download">💾 保存图片</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // 预加载头像，供 Canvas 导出使用
        if (!this.avatarImg) {
            const img = new Image();
            img.onload = () => { this.avatarImg = img; };
            img.src = 'avatar.png';
        }

        document.getElementById('sc-next-quote').addEventListener('click', () => this.nextQuote());
        document.getElementById('sc-download').addEventListener('click', () => this.download());
    }

    nextQuote() {
        this.quoteOffset++;
        const el = document.getElementById('sc-quote');
        if (el) el.textContent = this.getQuote();
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
            return;
        }
        const existing = document.querySelector('.share-card-modal');
        if (existing) existing.remove();
    }

    /* ---------- Canvas 导出 1080×1350 ---------- */

    wrapText(ctx, text, maxWidth) {
        const lines = [];
        let line = '';
        for (const ch of text) {
            if (ctx.measureText(line + ch).width > maxWidth && line) {
                lines.push(line);
                line = ch;
            } else {
                line += ch;
            }
        }
        if (line) lines.push(line);
        if (lines.length > 3) {
            lines.length = 3;
            lines[2] = lines[2].slice(0, -1) + '…';
        }
        return lines;
    }

    drawAvatar(ctx, size, cx, cy) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (this.avatarImg) {
            ctx.drawImage(this.avatarImg, cx - size / 2, cy - size / 2, size, size);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fill();
            ctx.fillStyle = '#ff6b81';
            ctx.font = `${size * 0.45}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❤', cx, cy + size * 0.03);
        }
        ctx.restore();
        // 光环
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 + 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 6;
        ctx.stroke();
    }

    async ensureAvatar() {
        if (this.avatarImg) return;
        await new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.avatarImg = img; resolve(); };
            img.onerror = () => resolve();
            img.src = 'avatar.png';
        });
    }

    async download() {
        const btn = document.getElementById('sc-download');
        if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }

        try {
            await this.ensureAvatar();

            const W = 1080, H = 1350;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            const fontStack = '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif';

            // 背景渐变（与 avatar / 主题一致）
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, '#ff6b81');
            bg.addColorStop(1, '#ff8fab');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // 装饰圆
            ctx.fillStyle = 'rgba(255,255,255,0.10)';
            ctx.beginPath(); ctx.arc(W - 60, 120, 300, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(80, H - 80, 340, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath(); ctx.arc(140, 260, 120, 0, Math.PI * 2); ctx.fill();

            // 星光
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = `42px ${fontStack}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦', 200, 430);
            ctx.font = `30px ${fontStack}`;
            ctx.fillText('✦', 880, 480);

            // 头像
            this.drawAvatar(ctx, 220, W / 2, 330);

            // 文案
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = `44px ${fontStack}`;
            ctx.fillText('我 们 已 经 相 爱', W / 2, 560);

            ctx.save();
            ctx.shadowColor = 'rgba(214,48,90,0.4)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 8;
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold 250px ${fontStack}`;
            ctx.fillText(String(this.getDays()), W / 2, 780);
            ctx.restore();

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = `46px ${fontStack}`;
            ctx.fillText('D A Y S', W / 2, 900);

            // 分割线 ❤
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(W / 2 - 330, 985); ctx.lineTo(W / 2 - 70, 985); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(W / 2 + 70, 985); ctx.lineTo(W / 2 + 330, 985); ctx.stroke();
            ctx.font = `44px ${fontStack}`;
            ctx.fillText('❤', W / 2, 988);

            // 情话（自动换行）
            ctx.font = `46px ${fontStack}`;
            ctx.fillStyle = '#ffffff';
            const lines = this.wrapText(ctx, this.getQuote(), 860);
            const lh = 76;
            let qy = 1080 - ((lines.length - 1) * lh) / 2;
            for (const line of lines) {
                ctx.fillText(line, W / 2, qy);
                qy += lh;
            }

            // 页脚
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `36px ${fontStack}`;
            ctx.fillText(`${this.footerText()} · ${this.todayText()}`, W / 2, 1230);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = `28px ${fontStack}`;
            ctx.fillText('O u r   M e m o r y', W / 2, 1295);

            const a = document.createElement('a');
            a.download = `love-card-${formatDate(new Date())}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '💾 保存图片'; }
        }
    }
}

const shareCard = new ShareCard();
