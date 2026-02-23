class ImageUtils {
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (e) => {
                reject(new Error('读取文件失败，请确保文件有效'));
            };
            reader.onabort = () => {
                reject(new Error('文件读取被中断'));
            };
            try {
                reader.readAsDataURL(file);
            } catch (err) {
                reject(new Error('无法读取文件: ' + err.message));
            }
        });
    }

    static async generateThumbnail(file, maxWidth = 300, maxHeight = 300) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let objectUrl = null;

            img.onload = () => {
                try {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = width * ratio;
                        height = height * ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    if (objectUrl) {
                        URL.revokeObjectURL(objectUrl);
                    }
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } catch (err) {
                    reject(new Error('生成缩略图失败: ' + err.message));
                }
            };

            img.onerror = (e) => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                }
                reject(new Error('图片加载失败，请确保文件是有效的图片格式'));
            };

            try {
                objectUrl = URL.createObjectURL(file);
                img.src = objectUrl;
            } catch (err) {
                reject(new Error('创建图片URL失败: ' + err.message));
            }
        });
    }

    static validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            throw new Error('只支持 JPG、PNG、WebP 格式');
        }

        if (file.size > maxSize) {
            throw new Error('文件大小不能超过 5MB');
        }

        return true;
    }
}
