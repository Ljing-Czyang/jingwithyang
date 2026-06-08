class UIUtils {
    /**
     * 将任意文本转换为安全的 HTML 字符串，避免用户输入直接拼接到模板中造成脚本注入。
     * @param {string|null|undefined} text - 需要转义的原始文本，可以为空值。
     * @returns {string} 转义后的 HTML 字符串，可安全插入 innerHTML 模板。
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

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
