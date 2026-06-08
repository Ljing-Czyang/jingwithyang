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

    /**
     * 将任意文本转换为可安全放入单引号 JavaScript 字符串字面量的内容。
     * @param {string|null|undefined} text - 需要作为 JavaScript 字符串参数传递的原始文本，可以为空值。
     * @returns {string} 转义后的字符串内容，可继续用于内联事件参数或脚本字符串。
     */
    static escapeJsString(text) {
        return (text == null ? '' : String(text))
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');
    }

    /**
     * 将任意文本转换为可安全嵌入内联事件处理器参数的字符串。
     * @param {string|null|undefined} text - 需要用于 onclick="fn('${value}')" 这类内联事件参数的原始文本。
     * @returns {string} 同时完成 JavaScript 字符串转义和 HTML 属性转义后的安全字符串。
     */
    static escapeInlineHandlerArg(text) {
        return UIUtils.escapeHtml(UIUtils.escapeJsString(text));
    }

    /**
     * 生成加载中视图的 HTML 字符串，并确保全局旋转动画只注入一次。
     * @returns {string} 加载中视图的 HTML 字符串。
     */
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

    /**
     * 生成错误提示视图的 HTML 字符串，动态错误文案会先进行 HTML 转义。
     * @param {string} message - 要展示给用户的错误提示文案。
     * @returns {string} 错误提示视图的 HTML 字符串。
     */
    static getErrorView(message = '加载失败，请刷新重试') {
        return `<p style="color: #ff6b6b; text-align: center; padding: 40px;">${UIUtils.escapeHtml(message)}</p>`;
    }

    /**
     * 生成空状态视图的 HTML 字符串，动态文本会先进行 HTML 转义。
     * @param {string} icon - 空状态图标或 emoji 文本。
     * @param {string} text - 空状态主文案。
     * @param {string} hint - 空状态辅助提示文案。
     * @returns {string} 空状态视图的 HTML 字符串。
     */
    static getEmptyView(icon, text, hint) {
        const safeIcon = UIUtils.escapeHtml(icon);
        const safeText = UIUtils.escapeHtml(text);
        const safeHint = UIUtils.escapeHtml(hint);

        return `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 12px;">${safeIcon}</div>
                <p style="margin: 4px 0; font-size: 15px;">${safeText}</p>
                ${safeHint ? `<p style="font-size: 13px; color: #bbb;">${safeHint}</p>` : ''}
            </div>
        `;
    }
}

UIUtils._loadingStyleInjected = false;
