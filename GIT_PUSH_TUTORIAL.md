# Git 推送教程

本教程将教您如何使用 Git 进行版本控制并将代码推送到 GitHub 远程仓库。

## 目录

1. [Git 基础概念](#git-基础概念)
2. [初始化 Git 仓库](#初始化-git-仓库)
3. [配置 Git](#配置-git)
4. [连接远程仓库](#连接远程仓库)
5. [提交代码](#提交代码)
6. [推送到远程](#推送到远程)
7. [常用命令速查](#常用命令速查)
8. [常见问题解决](#常见问题解决)

---

## Git 基础概念

### 工作区、暂存区和仓库

```
工作区 → 暂存区 → 本地仓库 → 远程仓库
```

- **工作区**：您在电脑上看到的文件目录
- **暂存区**：临时存放准备提交的文件
- **本地仓库**：本地保存的版本历史
- **远程仓库**：GitHub/GitLab 等云端仓库

---

## 初始化 Git 仓库

### 创建新仓库

```bash
# 在项目目录下初始化 Git
git init
```

### 克隆现有仓库

```bash
# 从 GitHub 克隆仓库
git clone https://github.com/用户名/仓库名.git
```

---

## 配置 Git

### 设置用户信息（首次使用必须）

```bash
# 设置用户名
git config --global user.name "您的用户名"

# 设置邮箱
git config --global user.email "您的邮箱@example.com"
```

### 查看配置

```bash
# 查看所有配置
git config --list

# 查看用户名
git config user.name

# 查看邮箱
git config user.email
```

---

## 连接远程仓库

### 添加远程仓库

```bash
# 添加远程仓库（使用 HTTPS）
git remote add origin https://github.com/用户名/仓库名.git

# 添加远程仓库（使用 SSH）
git remote add origin git@github.com:用户名/仓库名.git
```

### 查看远程仓库

```bash
# 查看远程仓库地址
git remote -v
```

### 修改远程仓库地址

```bash
# 修改远程仓库地址
git remote set-url origin https://github.com/新用户名/新仓库名.git
```

### 删除远程仓库

```bash
# 删除远程仓库连接
git remote remove origin
```

---

## 提交代码

### 查看文件状态

```bash
# 查看工作区状态
git status
```

### 添加文件到暂存区

```bash
# 添加指定文件
git add 文件名

# 添加所有文件
git add .

# 添加所有修改的文件
git add -A

# 添加所有修改和删除的文件
git add -u
```

### 提交到本地仓库

```bash
# 提交并添加说明
git commit -m "提交说明"

# 提交并跳过暂存区（直接提交所有修改）
git commit -am "提交说明"

# 修改最后一次提交
git commit --amend
```

### 查看提交历史

```bash
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看图形化历史
git log --graph --oneline
```

---

## 推送到远程

### 推送到远程仓库

```bash
# 推送到远程仓库的 main 分支
git push origin main

# 推送到远程仓库的 master 分支（旧项目）
git push origin master

# 首次推送并设置上游分支
git push -u origin main

# 强制推送（谨慎使用）
git push -f origin main
```

### 从远程仓库拉取更新

```bash
# 拉取远程更新并合并
git pull origin main

# 拉取远程更新但不合并
git fetch origin main
```

---

## 常用命令速查

### 日常开发流程

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交到本地仓库
git commit -m "描述您的修改"

# 4. 推送到远程仓库
git push origin main
```

### 查看命令

```bash
# 查看状态
git status

# 查看差异
git diff

# 查看已暂存的差异
git diff --staged

# 查看提交历史
git log

# 查看分支
git branch
```

### 撤销操作

```bash
# 撤销工作区的修改
git restore 文件名

# 撤销暂存区的修改
git restore --staged 文件名

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（不保留修改）
git reset --hard HEAD~1
```

### 分支操作

```bash
# 查看分支
git branch

# 创建新分支
git branch 分支名

# 切换分支
git checkout 分支名

# 创建并切换到新分支
git checkout -b 分支名

# 删除本地分支
git branch -d 分支名

# 删除远程分支
git push origin --delete 分支名
```

---

## 常见问题解决

### 1. 推送时提示 "src refspec master does not match any"

**原因：** 本地分支名称与远程分支名称不匹配

**解决方法：**
```bash
# 查看本地分支
git branch

# 使用正确的分支名称推送
git push origin main
```

### 2. 推送时提示 "Updates were rejected"

**原因：** 远程仓库有新的提交，本地不是最新

**解决方法：**
```bash
# 先拉取远程更新
git pull origin main

# 然后再推送
git push origin main

# 或者强制推送（谨慎使用）
git push -f origin main
```

### 3. 提交时提示 "nothing to commit"

**原因：** 没有修改的文件需要提交

**解决方法：**
```bash
# 查看状态
git status

# 如果有修改，先添加文件
git add .

# 然后提交
git commit -m "提交说明"
```

### 4. 推送时提示 "fatal: 'origin' does not appear to be a git repository"

**原因：** 没有配置远程仓库

**解决方法：**
```bash
# 添加远程仓库
git remote add origin https://github.com/用户名/仓库名.git

# 然后再推送
git push origin main
```

### 5. 提示 "Please tell me who you are"

**原因：** 没有配置 Git 用户信息

**解决方法：**
```bash
# 配置用户名
git config --global user.name "您的用户名"

# 配置邮箱
git config --global user.email "您的邮箱@example.com"
```

### 6. 如何修改已提交的说明

```bash
# 修改最后一次提交的说明
git commit --amend -m "新的提交说明"

# 如果已经推送到远程，需要强制推送
git push -f origin main
```

### 7. 如何查看远程仓库地址

```bash
# 查看远程仓库信息
git remote -v
```

### 8. 如何忽略某些文件

创建 `.gitignore` 文件，添加需要忽略的文件或目录：

```
# 忽略 node_modules 目录
node_modules/

# 忽略 .env 文件
.env

# 忽略所有 .log 文件
*.log

# 忽略 IDE 配置文件
.vscode/
.idea/
```

---

## 完整示例

### 首次推送新项目

```bash
# 1. 初始化 Git 仓库
git init

# 2. 配置用户信息（首次使用）
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱@example.com"

# 3. 添加所有文件
git add .

# 4. 提交到本地仓库
git commit -m "初始提交"

# 5. 添加远程仓库
git remote add origin https://github.com/用户名/仓库名.git

# 6. 推送到远程仓库
git push -u origin main
```

### 日常开发流程

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交到本地仓库
git commit -m "添加新功能"

# 4. 推送到远程仓库
git push origin main
```

---

## 最佳实践

1. **频繁提交**：小步快跑，每个功能完成后及时提交
2. **清晰的提交信息**：使用简洁明了的提交说明
3. **推送前拉取**：推送前先执行 `git pull`，避免冲突
4. **使用分支**：开发新功能时使用分支，不要直接在 main 分支开发
5. **定期备份**：重要代码及时推送到远程仓库
6. **使用 .gitignore**：忽略不需要版本控制的文件

---

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 官方文档](https://docs.github.com/)
- [Pro Git 中文版](https://git-scm.com/book/zh/v2)

---

**祝您使用 Git 愉快！** 🚀
