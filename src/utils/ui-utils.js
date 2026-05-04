class UIUtils {
    static getLoadingView() {
        if (!UIUtils._loadingStyleInjected) {
            const style = document.createElement('style');
            style.textContent = `@keyframes ui-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
            UIUtils._loadingStyleInjected = true;
        }
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;">
                <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #ff6b6b; border-radius: 50%; animation: ui-spin 1s linear infinite;"></div>
                <p style="color: #888; margin-top: 16px;">加载中...</p>
            </div>
        `;
    }

    static getErrorView(message = '加载失败，请刷新重试') {
        return `<p style="color: #ff6b6b; text-align: center; padding: 40px;">${message}</p>`;
    }

    static getEmptyView(icon, text, hint) {
        return `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 12px;">${icon}</div>
                <p style="margin: 4px 0; font-size: 15px;">${text}</p>
                ${hint ? `<p style="font-size: 13px; color: #bbb;">${hint}</p>` : ''}
            </div>
        `;
    }
}

UIUtils._loadingStyleInjected = false;
