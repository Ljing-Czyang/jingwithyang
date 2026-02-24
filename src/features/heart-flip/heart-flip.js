class HeartFlip {
    constructor() {
        this.currentIndex = 0;
        this.isFlipping = false;
        this.usedIndices = [];
        this.modal = null;
    }

    show() {
        this.modal = document.createElement('div');
        this.modal.className = 'heart-flip-modal';
        this.modal.innerHTML = `
            <div class="heart-flip-container">
                <div class="heart-flip-header">
                    <h3>💕 心动折页</h3>
                    <button class="heart-flip-close" onclick="heartFlip.close()">✕</button>
                </div>
                <div class="heart-flip-body">
                    <div class="card-glow" id="card-glow"></div>
                    <div class="card-container" id="card-container">
                        <div class="card" id="flip-card">
                            <div class="card-front">
                                <div class="card-content">
                                    <div class="quote-text" id="quote-text"></div>
                                </div>
                                <div class="card-corner"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flip-hint">点击卡片或向左滑动</div>
                    <div class="heart-particles" id="heart-particles"></div>
                </div>
                <div class="heart-flip-footer">
                    <div class="flip-counter">
                        <span id="current-index">1</span> / <span id="total-quotes">${QUOTES.length}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.initCard();
        this.bindEvents();
    }

    initCard() {
        const quote = this.getRandomQuote();
        this.updateCardContent(quote);
    }

    getRandomQuote() {
        if (this.usedIndices.length >= QUOTES.length) {
            this.usedIndices = [];
        }
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * QUOTES.length);
        } while (this.usedIndices.includes(randomIndex));
        
        this.usedIndices.push(randomIndex);
        this.currentIndex = this.usedIndices.length;
        
        return QUOTES[randomIndex];
    }

    updateCardContent(quote) {
        const textEl = document.getElementById('quote-text');
        const glowEl = document.getElementById('card-glow');
        const cardEl = document.getElementById('flip-card');
        const cardFront = cardEl ? cardEl.querySelector('.card-front') : null;
        
        if (textEl) textEl.textContent = quote.text;
        
        const moodConfig = MOOD_CONFIG[quote.mood];
        
        if (glowEl) {
            glowEl.style.background = `radial-gradient(circle, ${quote.color}40 0%, transparent 70%)`;
        }
        
        if (cardEl) {
            cardEl.style.transitionTimingFunction = moodConfig.damping;
            cardEl.dataset.effect = moodConfig.effect;
        }
        
        if (cardFront) {
            cardFront.classList.remove('mood-sweet', 'mood-deep', 'mood-playful');
            cardFront.classList.add(moodConfig.cardStyle);
        }
        
        const counterEl = document.getElementById('current-index');
        if (counterEl) counterEl.textContent = this.currentIndex;
    }

    bindEvents() {
        const cardContainer = document.getElementById('card-container');
        if (!cardContainer) return;

        cardContainer.addEventListener('click', () => this.handleFlip());
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        cardContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        cardContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                this.handleFlip();
            }
        }, { passive: true });
    }

    handleFlip() {
        if (this.isFlipping) return;
        this.isFlipping = true;
        
        const card = document.getElementById('flip-card');
        if (!card) return;
        
        card.classList.add('is-flipping');
        
        this.triggerHapticFeedback();
        
        setTimeout(() => {
            const newQuote = this.getRandomQuote();
            this.updateCardContent(newQuote);
            this.createHeartParticles();
        }, 300);
        
        setTimeout(() => {
            card.classList.remove('is-flipping');
            this.isFlipping = false;
        }, 600);
    }

    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    createHeartParticles() {
        const container = document.getElementById('heart-particles');
        if (!container) return;
        
        container.innerHTML = '';
        
        const hearts = ['❤️', '💕', '💗', '💖', '💝'];
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'heart-particle';
            particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            particle.style.left = `${Math.random() * 80 + 10}%`;
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            particle.style.animationDuration = `${1 + Math.random() * 0.5}s`;
            container.appendChild(particle);
        }
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

const heartFlip = new HeartFlip();
