class HeartFlip {
    constructor() {
        this.currentIndex = 0;
        this.isFlipping = false;
        this.usedIndices = [];
        this.history = [];
        this.historyIndex = -1;
        this.modal = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.dragState = {
            isDragging: false,
            startX: null,
            startY: null
        };
        this.boundEvents = null;
        this.pendingTimeouts = [];
    }

    show() {
        if (this.modal) {
            this.close();
        }

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
                            </div>
                            <div class="card-back">
                                <div class="card-back-content">
                                    <div class="card-back-icon">💕</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flip-hint">点击卡片或左右滑动</div>
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
        this.history = [quote];
        this.historyIndex = 0;
        this.currentIndex = 1;
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
        
        this.currentIndex = this.historyIndex + 1;
        
        const counterEl = document.getElementById('current-index');
        if (counterEl) counterEl.textContent = this.currentIndex;
        
        const totalEl = document.getElementById('total-quotes');
        if (totalEl) totalEl.textContent = QUOTES.length;
    }

    setManagedTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.pendingTimeouts = this.pendingTimeouts.filter(id => id !== timeoutId);
            callback();
        }, delay);

        this.pendingTimeouts.push(timeoutId);
        return timeoutId;
    }

    clearPendingTimeouts() {
        this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.pendingTimeouts = [];
    }

    unbindEvents() {
        if (!this.boundEvents) return;

        const cardContainer = document.getElementById('card-container');
        if (cardContainer) {
            cardContainer.removeEventListener('click', this.boundEvents.click);
            cardContainer.removeEventListener('touchstart', this.boundEvents.touchstart);
            cardContainer.removeEventListener('touchmove', this.boundEvents.touchmove);
            cardContainer.removeEventListener('touchend', this.boundEvents.touchend);
            cardContainer.removeEventListener('mousedown', this.boundEvents.mousedown);
        }

        document.removeEventListener('mousemove', this.boundEvents.mousemove);
        document.removeEventListener('mouseup', this.boundEvents.mouseup);

        this.boundEvents = null;
        this.dragState.isDragging = false;
        this.dragState.startX = null;
        this.dragState.startY = null;
    }

    bindEvents() {
        const cardContainer = document.getElementById('card-container');
        const card = document.getElementById('flip-card');
        if (!cardContainer || !card) return;

        this.unbindEvents();

        const handleStart = (x, y) => {
            this.dragState.isDragging = false;
            this.dragState.startX = x;
            this.dragState.startY = y;
            this.touchStartX = x;
            this.touchStartY = y;
            card.style.transition = 'none';
        };
        
        const handleMove = (x, y) => {
            if (this.dragState.startX === null || this.dragState.startY === null) return;

            const deltaX = x - this.dragState.startX;
            const deltaY = y - this.dragState.startY;
            
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                this.dragState.isDragging = true;
            }
            
            const rotateY = deltaX / 10;
            const rotateX = -deltaY / 10;
            
            card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        };
        
        const handleEnd = (x) => {
            if (this.dragState.startX === null || this.dragState.startY === null) return;

            const deltaX = x - this.touchStartX;
            
            card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
            
            if (deltaX > 50) {
                this.handleFlip('prev');
            } else if (deltaX < -50) {
                this.handleFlip('next');
            }

            this.dragState.startX = null;
            this.dragState.startY = null;
            
            this.setManagedTimeout(() => {
                this.dragState.isDragging = false;
            }, 50);
        };

        this.boundEvents = {
            click: () => {
                if (!this.dragState.isDragging) {
                    this.handleFlip('next');
                }
            },
            touchstart: (e) => {
                handleStart(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            },
            touchmove: (e) => {
                handleMove(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            },
            touchend: (e) => {
                handleEnd(e.changedTouches[0].screenX);
            },
            mousedown: (e) => {
                handleStart(e.screenX, e.screenY);
                e.preventDefault();
            },
            mousemove: (e) => {
                handleMove(e.screenX, e.screenY);
            },
            mouseup: (e) => {
                handleEnd(e.screenX);
            }
        };

        cardContainer.addEventListener('click', this.boundEvents.click);
        cardContainer.addEventListener('touchstart', this.boundEvents.touchstart, { passive: true });
        cardContainer.addEventListener('touchmove', this.boundEvents.touchmove, { passive: true });
        cardContainer.addEventListener('touchend', this.boundEvents.touchend, { passive: true });
        cardContainer.addEventListener('mousedown', this.boundEvents.mousedown);
        document.addEventListener('mousemove', this.boundEvents.mousemove);
        document.addEventListener('mouseup', this.boundEvents.mouseup);
    }

    handleFlip(direction = 'next') {
        if (this.isFlipping) return;
        this.isFlipping = true;
        
        const card = document.getElementById('flip-card');
        if (!card) {
            this.isFlipping = false;
            return;
        }
        
        const flipClass = direction === 'next' ? 'is-flipping-next' : 'is-flipping-prev';
        card.classList.add(flipClass);
        
        this.triggerHapticFeedback();
        
        this.setManagedTimeout(() => {
            let newQuote;
            
            if (direction === 'prev' && this.historyIndex > 0) {
                this.historyIndex--;
                newQuote = this.history[this.historyIndex];
            } else if (direction === 'next') {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    newQuote = this.history[this.historyIndex];
                } else {
                    newQuote = this.getRandomQuote();
                    this.history.push(newQuote);
                    this.historyIndex = this.history.length - 1;
                    this.createHeartParticles();
                }
            } else {
                card.classList.remove(flipClass);
                this.isFlipping = false;
                return;
            }
            
            this.updateCardContent(newQuote);
        }, 300);
        
        this.setManagedTimeout(() => {
            card.classList.remove(flipClass);
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
        
        this.setManagedTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }

    close() {
        this.clearPendingTimeouts();
        this.unbindEvents();
        this.isFlipping = false;

        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

const heartFlip = new HeartFlip();
