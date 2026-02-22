class LoginFeature {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('btn-unlock').addEventListener('click', () => this.checkPass());
        document.getElementById('dev-settings-btn').addEventListener('click', () => this.showSyncConfig());
    }

    checkPass() {
        if (els.passcode.value === CONFIG.passcode) {
            this.showHome();
        } else {
            alert("密码不对哦！😤");
            els.passcode.value = "";
        }
    }

    showHome() {
        els.loginPage.classList.remove('active');
        els.loginPage.style.transform = 'translateX(-100%)';
        els.loginPage.style.pointerEvents = 'none';
        
        els.homePage.classList.add('active');
        setTimeout(() => { els.loginPage.style.display = 'none'; }, 500);

        homeFeature.startTimer();
        homeFeature.startTypewriter();
    }

    showSyncConfig() {
        const existingToken = localStorage.getItem('gh_token');
        const hasToken = !!existingToken;
        
        const modal = document.createElement('div');
        modal.className = 'sync-config-modal';
        modal.innerHTML = `
            <div class="sync-config-content">
                <div class="sync-config-header">
                    <h3>⚙️ 同步配置</h3>
                    <button onclick="this.closest('.sync-config-modal').remove()">✕</button>
                </div>
                <div class="sync-config-body">
                    <label>GitHub Token（用于云端同步）</label>
                    <input type="password" id="gh-token-input" placeholder="ghp_xxxxxxxxxxxx" value="${existingToken || ''}">
                    <div class="sync-config-status ${hasToken ? 'success' : ''}" id="sync-status" style="${hasToken ? '' : 'display: none;'}">
                        ${hasToken ? '✅ 已配置同步密钥' : ''}
                    </div>
                </div>
                <div class="sync-config-footer">
                    <button class="btn-cancel-token" onclick="this.closest('.sync-config-modal').remove()">取消</button>
                    <button class="btn-save-token" id="btn-save-token">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-save-token').addEventListener('click', () => this.saveToken());
    }

    saveToken() {
        const tokenInput = document.getElementById('gh-token-input');
        const statusEl = document.getElementById('sync-status');
        const token = tokenInput.value.trim();

        if (token) {
            localStorage.setItem('gh_token', token);
            statusEl.className = 'sync-config-status success';
            statusEl.style.display = 'block';
            statusEl.textContent = '✅ 已配置同步密钥';
            
            setTimeout(() => {
                document.querySelector('.sync-config-modal').remove();
            }, 1000);
        } else {
            localStorage.removeItem('gh_token');
            statusEl.className = 'sync-config-status error';
            statusEl.style.display = 'block';
            statusEl.textContent = '❌ 请输入有效的 Token';
        }
    }
}

const loginFeature = new LoginFeature();
