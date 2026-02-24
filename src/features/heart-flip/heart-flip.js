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
        if (totalEl) totalEl.textContent = this.history.length;
    }

    bindEvents() {
        const cardContainer = document.getElementById('card-container');
        const card = document.getElementById('flip-card');
        if (!cardContainer || !card) return;

        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;

        cardContainer.addEventListener('click', (e) => {
            if (!isDragging) {
                this.handleFlip('next');
            }
        });
        
        const handleStart = (x, y) => {
            isDragging = false;
            dragStartX = x;
            dragStartY = y;
            this.touchStartX = x;
            this.touchStartY = y;
            card.style.transition = 'none';
        };
        
        const handleMove = (x, y) => {
            const deltaX = x - dragStartX;
            const deltaY = y - dragStartY;
            
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isDragging = true;
            }
            
            const rotateY = deltaX / 10;
            const rotateX = -deltaY / 10;
            
            card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        };
        
        const handleEnd = (x) => {
            const deltaX = x - this.touchStartX;
            
            card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
            
            if (deltaX > 50) {
                this.handleFlip('prev');
            } else if (deltaX < -50) {
                this.handleFlip('next');
            }
            
            setTimeout(() => {
                isDragging = false;
            }, 50);
        };
        
        cardContainer.addEventListener('touchstart', (e) => {
            handleStart(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
        }, { passive: true });
        
        cardContainer.addEventListener('touchmove', (e) => {
            handleMove(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
        }, { passive: true });
        
        cardContainer.addEventListener('touchend', (e) => {
            handleEnd(e.changedTouches[0].screenX);
        }, { passive: true });
        
        cardContainer.addEventListener('mousedown', (e) => {
            handleStart(e.screenX, e.screenY);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (dragStartX !== 0 || dragStartY !== 0) {
                handleMove(e.screenX, e.screenY);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (dragStartX !== 0 || dragStartY !== 0) {
                handleEnd(e.screenX);
                dragStartX = 0;
                dragStartY = 0;
            }
        });
    }

    handleFlip(direction = 'next') {
        if (this.isFlipping) return;
        this.isFlipping = true;
        
        const card = document.getElementById('flip-card');
        if (!card) return;
        
        const flipClass = direction === 'next' ? 'is-flipping-next' : 'is-flipping-prev';
        card.classList.add(flipClass);
        
        this.triggerHapticFeedback();
        
        setTimeout(() => {
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
        
        setTimeout(() => {
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
