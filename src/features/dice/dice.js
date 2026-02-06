class DiceGame {
    constructor() {
        this.rolling = false;
        this.diceValues = [1, 2, 3, 4, 5, 6];
        this.diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    }

    roll() {
        if (this.rolling) return;
        
        const existingModal = document.querySelector('.dice-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
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
        this.rolling = true;
        
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
