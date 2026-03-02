# 项目结构说明文档

## 项目概述
本项目是一个情侣专属空间应用，包含登录、首页、日历、私密相册、掷骰子、心动折页等功能模块。项目采用模块化结构，便于维护和扩展。

### 核心特性
- **性能优化**：图片懒加载、CSS模块化拆分
- **用户体验**：3D心动折页、手势控制、响应式设计
- **数据管理**：本地存储、照片上传与管理
- **视觉效果**：粒子动画、3D翻页、打字机效果

## 目录结构

```
jingwithyang/
├── index.html                    # 主入口HTML文件
├── src/                          # 源代码根目录
│   ├── assets/                   # 静态资源文件夹（图片、字体等）
│   ├── components/               # 可复用组件
│   ├── data/                     # 数据文件
│   │   └── quotes.js             # 心动折页情话数据
│   ├── utils/                   # 工具函数
│   │   ├── config.js            # 配置中心（密码、日期、情书等）
│   │   ├── dom.js               # DOM元素引用
│   │   ├── helpers.js           # 通用工具函数
│   │   ├── image-utils.js       # 图片处理工具
│   │   └── storage.js           # 存储管理器
│   ├── styles/                  # 样式文件
│   │   ├── base.css             # 基础样式和变量
│   │   ├── components.css       # 组件样式
│   │   ├── layout.css           # 布局样式
│   │   ├── features/            # 功能模块样式
│   │   │   ├── calendar.css     # 日历样式
│   │   │   ├── dice.css         # 掷骰子样式
│   │   │   └── heart-flip.css   # 心动折页样式
│   │   └── main.css             # 主样式文件（导入其他样式）
│   ├── features/                # 按功能划分的模块文件夹
│   │   ├── login/               # 登录功能模块
│   │   │   └── login.js         # 登录逻辑
│   │   ├── home/                # 首页功能模块
│   │   │   └── home.js          # 首页逻辑（计时器、打字机、导航等）
│   │   ├── calendar/            # 日历功能模块
│   │   │   └── calendar.js      # 日历逻辑
│   │   ├── album/               # 相册功能模块
│   │   │   └── album.js         # 相册逻辑
│   │   ├── dice/                # 掷骰子功能模块
│   │   │   └── dice.js          # 掷骰子逻辑
│   │   ├── heart-flip/          # 心动折页功能模块
│   │   │   └── heart-flip.js    # 心动折页逻辑
│   │   └── lab/                 # 实验室功能模块
│   └── app.js                   # 应用初始化和事件绑定
│
├── .gitignore                   # Git忽略文件配置
└── PROJECT_STRUCTURE.md          # 项目结构说明文档
```

## 目录和文件详细说明

### 1. 根目录文件

#### index.html
- **功能**：应用的主入口HTML文件
- **作用**：
  - 定义页面结构
  - 加载CSS和JavaScript文件
  - 包含登录页面、主页、侧边栏、相册视图等UI组件
- **依赖**：src/styles/main.css, src/utils/*.js, src/features/**/*.js, src/app.js

### 2. src/ 目录

#### src/assets/
- **功能**：存放静态资源文件
- **用途**：图片、字体、图标等静态资源
- **当前状态**：空目录，预留用于未来扩展

#### src/components/
- **功能**：存放可复用的UI组件
- **用途**：如按钮、卡片、模态框等通用组件
- **当前状态**：空目录，预留用于未来扩展

#### src/data/
- **功能**：存放数据文件
- **用途**：静态数据、配置数据等

##### src/data/quotes.js
- **功能**：心动折页情话数据
- **内容**：
  - QUOTES：情话数组，包含文字、颜色、情绪类型
  - MOOD_CONFIG：情绪配置，包含动画效果、卡片样式
- **使用方式**：被心动折页模块调用

#### src/utils/
存放工具函数和配置文件

##### src/utils/config.js
- **功能**：应用配置中心
- **内容**：
  - passcode：登录密码（Base64编码）
  - startDate：恋爱开始日期
  - loveLetter：情书内容
  - specialDates：特殊日期列表
  - monthlyAnniversary：每月纪念日
  - events：事件列表
- **使用方式**：所有模块通过全局变量CONFIG访问配置

##### src/utils/dom.js
- **功能**：DOM元素引用管理
- **内容**：集中管理所有DOM元素引用
- **使用方式**：所有模块通过全局变量els访问DOM元素

##### src/utils/helpers.js
- **功能**：通用工具函数
- **内容**：
  - formatDate(date)：格式化日期为YYYY-MM-DD
  - isSameDay(date1, date2)：判断两个日期是否相同
  - calculateDaysBetween(startDate, endDate)：计算两个日期之间的天数
- **使用方式**：被各个功能模块调用

##### src/utils/image-utils.js
- **功能**：图片处理工具类
- **内容**：
  - fileToBase64(file)：文件转Base64
  - generateThumbnail(file, maxWidth, maxHeight)：生成缩略图
  - validateFile(file)：验证文件格式和大小
- **使用方式**：被相册和日历模块调用

##### src/utils/storage.js
- **功能**：存储管理器
- **内容**：
  - loadPhotos()：从localStorage加载照片
  - savePhotos()：保存照片到localStorage
  - uploadPhoto(file, dateStr, title, description)：上传照片
  - getPhotos()：获取所有照片
  - getPhotosByDate(dateStr)：按日期获取照片
  - deletePhoto(photoId)：删除照片
  - togglePrivacy(photoId)：切换私密状态
- **当前实现**：使用localStorage存储，预留Supabase接入位置
- **全局实例**：storage

#### src/styles/
存放样式文件

##### src/styles/base.css
- **功能**：基础样式和CSS变量
- **内容**：
  - CSS变量定义（颜色、渐变等）
  - 基础样式（body、容器等）
  - 通用工具类

##### src/styles/components.css
- **功能**：组件样式
- **内容**：
  - 按钮样式
  - 卡片样式
  - 模态框样式
  - 通用组件样式

##### src/styles/layout.css
- **功能**：布局样式
- **内容**：
  - 侧边栏样式
  - 页面布局
  - 响应式布局
  - 导航样式

##### src/styles/features/
- **功能**：功能模块样式
- **用途**：按功能划分的样式文件

###### src/styles/features/calendar.css
- **功能**：日历功能样式
- **内容**：
  - 日历容器样式
  - 日期样式
  - 特殊日期标记
  - 照片详情样式

###### src/styles/features/dice.css
- **功能**：掷骰子功能样式
- **内容**：
  - 骰子容器样式
  - 骰子动画
  - 结果显示样式

###### src/styles/features/heart-flip.css
- **功能**：心动折页功能样式
- **内容**：
  - 卡片3D效果
  - 翻转动画
  - 情绪样式
  - 粒子效果

##### src/styles/main.css
- **功能**：主样式文件
- **内容**：
  - 导入其他样式文件
  - 全局样式覆盖
  - 动画效果

#### src/features/
按功能划分的模块文件夹

##### src/features/login/
登录功能模块

###### src/features/login/login.js
- **功能**：登录功能实现
- **类名**：LoginFeature
- **主要方法**：
  - init()：初始化事件监听
  - checkPass()：验证密码
  - showHome()：显示主页并启动特效
- **全局实例**：loginFeature

##### src/features/home/
首页功能模块

###### src/features/home/home.js
- **功能**：首页功能实现
- **类名**：HomeFeature
- **主要方法**：
  - startTimer()：启动恋爱天数计时器
  - startTypewriter()：启动情书打字机效果
  - toggleSidebar(show)：切换侧边栏显示
  - switchView(viewName)：切换视图（首页/实验室/日历/相册）
  - switchBottomTab(tabName, tabElement)：切换底部标签页
- **全局实例**：homeFeature

##### src/features/calendar/
日历功能模块

###### src/features/calendar/calendar.js
- **功能**：日历功能实现
- **类名**：CoupleCalendar
- **主要方法**：
  - show()：显示日历模态框
  - render()：渲染日历视图
  - changeMonth(delta)：切换月份
  - updateCalendar()：更新日历显示
  - renderSpecialDates()：渲染特殊日期列表
  - showDateDetails(dateStr)：显示日期详情
  - showDatePhotos(dateStr, dateModal)：显示该日期的照片
  - closeDatePhotos(dateStr)：关闭照片查看
  - showPhotoDetail(photoId, dateStr)：显示照片详情
  - deletePhoto(photoId, dateStr, modal)：删除照片
  - showUploadModal(dateStr)：显示上传弹窗
  - setupUploadEvents(dateStr)：设置上传事件
  - isSpecialDate(dateStr)：判断是否为特殊日期
- **全局实例**：calendar

##### src/features/album/
相册功能模块

###### src/features/album/album.js
- **功能**：相册功能实现
- **类名**：AlbumFeature
- **主要方法**：
  - show()：显示相册视图
  - renderAlbumView()：渲染相册
  - groupPhotosByDate()：按日期分组照片
  - setFilter(filter)：设置筛选
  - showPhotoDetail(photoId)：显示照片详情
  - deletePhoto(photoId, modal)：删除照片
  - refresh()：刷新相册
- **全局实例**：albumFeature

##### src/features/dice/
掷骰子功能模块

###### src/features/dice/dice.js
- **功能**：掷骰子游戏实现
- **类名**：DiceGame
- **主要方法**：
  - roll()：开始掷骰子
  - startRolling()：执行掷骰子动画
  - finalRoll()：显示最终结果
- **全局实例**：diceGame

##### src/features/heart-flip/
心动折页功能模块

###### src/features/heart-flip/heart-flip.js
- **功能**：心动折页实现
- **类名**：HeartFlip
- **主要方法**：
  - show()：显示心动折页模态框
  - initCard()：初始化卡片
  - getRandomQuote()：获取随机情话
  - updateCardContent(quote)：更新卡片内容
  - bindEvents()：绑定事件
  - handleFlip(direction)：处理翻页
  - createHeartParticles()：创建爱心粒子效果
- **全局实例**：heartFlip

##### src/features/lab/
实验室功能模块
- **当前状态**：空目录，预留用于未来扩展

#### src/app.js
- **功能**：应用初始化和全局事件绑定
- **内容**：
  - DOMContentLoaded事件监听
  - 侧边栏开关事件
  - 菜单切换事件
  - 底部标签页切换事件
  - 相册菜单事件
- **作用**：协调各功能模块的初始化

## 文件引用关系

### HTML文件引用顺序
```
index.html
├── src/styles/main.css
├── src/utils/config.js
├── src/utils/dom.js
├── src/utils/helpers.js
├── src/utils/image-utils.js
├── src/utils/storage.js
├── src/data/quotes.js
├── src/features/login/login.js
├── src/features/home/home.js
├── src/features/calendar/calendar.js
├── src/features/dice/dice.js
├── src/features/album/album.js
├── src/features/heart-flip/heart-flip.js
└── src/app.js
```

### JavaScript模块依赖关系
```
src/app.js
├── src/utils/dom.js
├── src/features/login/login.js
│   ├── src/utils/config.js
│   └── src/features/home/home.js
├── src/features/home/home.js
│   ├── src/utils/config.js
│   └── src/utils/helpers.js
├── src/features/calendar/calendar.js
│   ├── src/utils/config.js
│   ├── src/utils/helpers.js
│   ├── src/utils/image-utils.js
│   └── src/utils/storage.js
├── src/features/album/album.js
│   └── src/utils/storage.js
├── src/features/dice/dice.js
└── src/features/heart-flip/heart-flip.js
    ├── src/data/quotes.js
```

## 代码规范

### 命名规范
- **文件名**：使用小写字母和连字符（kebab-case）
- **类名**：使用大驼峰命名法（PascalCase）
- **变量名**：使用小驼峰命名法（camelCase）
- **常量名**：使用大写字母和下划线（UPPER_SNAKE_CASE）

### 代码注释
- 每个模块都有清晰的类名和功能说明
- 关键方法都有注释说明其作用
- 配置项有清晰的注释说明

### 代码格式
- 使用一致的缩进（4个空格）
- 遵循JavaScript最佳实践
- 使用ES6+语法特性

## 运行方式

### 本地文件系统运行
直接在浏览器中打开 `index.html` 文件即可运行。

### 服务器运行
使用Python内置服务器：
```bash
python -m http.server 8000
```
然后在浏览器中访问 `http://localhost:8000`

## 功能模块说明

### 1. 登录功能
- 输入4位数字密码
- 密码验证
- 登录成功后显示主页

### 2. 首页功能
- 恋爱天数计时器
- 情书打字机效果
- 时间线展示
- 侧边栏导航
- 底部标签页切换

### 3. 日历功能
- 显示当前月份日历
- 标记特殊日期
- 显示每月纪念日
- 查看日期详情
- 切换月份
- 日期上显示照片标记（小红点）
- 查看日期照片
- 上传照片到指定日期

### 4. 私密相册功能
- 按日期分组展示所有照片
- 点击查看照片大图
- 照片预览和删除
- 筛选功能
- **图片懒加载**：提升页面加载速度

### 5. 照片上传功能
- 点击或拖拽上传照片
- 支持JPG、PNG、WebP格式
- 文件大小限制5MB
- 自动生成缩略图
- 照片标题和描述
- 实时预览

### 6. 掷骰子功能
- 掷骰子动画效果
- 显示掷骰结果
- 支持重复掷骰

### 7. 心动折页功能
- 3D卡片翻页效果
- 随机情话展示
- 情绪分类（微甜、深情、调皮）
- 左右滑动查看历史记录
- 卡片随手势转动
- 爱心粒子效果

## 移动端适配

项目包含完整的移动端适配样式，支持：
- 响应式布局
- 触摸友好的交互
- 移动端优化的字体和间距
- 适配不同屏幕尺寸

## 扩展指南

### 添加新功能模块
1. 在 `src/features/` 下创建新文件夹
2. 创建对应的JavaScript文件
3. 在 `src/styles/features/` 下创建对应的CSS文件
4. 在 `index.html` 中引入新文件
5. 在 `src/app.js` 中添加初始化逻辑

### 添加新样式
1. 在 `src/styles/features/` 中添加新的CSS文件
2. 在 `src/styles/main.css` 中导入新样式文件

### 添加新数据文件
1. 在 `src/data/` 下创建新文件
2. 在需要的模块中引入使用

### 接入 Supabase（替代 localStorage）
1. 创建 Supabase 项目
2. 在 SQL Editor 中运行数据库表创建脚本
3. 创建名为 `photos` 的存储桶（公开访问）
4. 修改 `src/utils/storage.js`，替换为 Supabase 版本
5. 在 `index.html` 中引入 Supabase CDN
6. 填入项目 URL 和 anon key

### 照片数据结构
```javascript
{
    id: "photo_001",
    date: "2026-02-25",
    title: "照片标题",
    description: "照片描述",
    imageUrl: "data:image/jpeg;base64,...",
    thumbnailUrl: "data:image/jpeg;base64,...",
    uploadedBy: "user_001",
    uploadedByName: "境",
    uploadedByAvatar: "❤️",
    createdAt: "2026-02-25T10:30:00",
    isPrivate: false
}
```

## 注意事项

1. **配置修改**：所有配置项都在 `src/utils/config.js` 中，修改时请注意密码的Base64编码
2. **DOM元素**：新增DOM元素时，记得在 `src/utils/dom.js` 中添加引用
3. **全局变量**：各功能模块通过全局变量访问，注意变量命名冲突
4. **文件引用**：新增文件时，确保在 `index.html` 中正确引用
5. **移动端适配**：新增样式时，注意添加移动端适配的媒体查询

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式和动画
- **JavaScript (ES6+)**：逻辑实现
- **原生DOM API**：DOM操作
- **CSS Grid & Flexbox**：布局

## 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari
- 移动端浏览器

## 版本历史

- v2.2：性能优化（图片懒加载），CSS模块化完善，移动端兼容性修复
- v2.1：添加心动折页功能，CSS模块化重构
- v2.0：模块化重构，提升代码可维护性
- v1.0：初始版本

## 联系方式

如有问题或建议，请联系开发者。
