class LoginFeature {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('btn-unlock').addEventListener('click', () => this.checkPass());
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
}

const loginFeature = new LoginFeature();
