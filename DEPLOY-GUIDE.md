# CodeClaw 部署指南（手动版）

> 由于网络环境限制，请按以下步骤手动部署。全程约 10 分钟。

---

## 第一步：打包代码

1. 打开文件管理器，进入 `c:\Users\86158\WorkBuddy\Claw\token-platform\`
2. 选中以下文件/文件夹，右键 → "添加到压缩文件"（zip）：
   - `client/` 文件夹
   - `server/` 文件夹
   - `README.md`
   - `DEPLOY.md`
   - `LAUNCH.md`
   - `vercel.json`
   - `.gitignore`
3. 保存为 `codeclaw.zip`

---

## 第二步：使用现有 GitHub 仓库

你的仓库已存在，名为 `agentclaw`。

### 上传代码到 GitHub

#### 方式 A：网页上传（最简单）

1. 打开 https://github.com/YOUR_USERNAME/agentclaw
2. 点击 **"Add file" → "Upload files"**
3. 点击 **"choose your files"**
4. 选择打包好的 `agentclaw.zip`（或逐个选择文件）
5. 点击 **Commit changes**
6. 如果上传了 zip，点击文件 → **"Extract files"** 解压

#### 方式 B：命令行（如果你有 Git）

```bash
cd c:\Users\86158\WorkBuddy\Claw\token-platform
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentclaw.git
git push -u origin main --force
```

---

## 第四步：部署后端到 Railway

### 4.1 注册 Railway

1. 打开 https://railway.app
2. 点击 **"Start for Free"**
3. 用 GitHub 账号登录

### 4.2 创建项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择你的 `agentclaw` 仓库
4. 点击 **"Add Variables"**，添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | `codeclaw-secret-2026-change-me` |
| `DEEPSEEK_API_KEY` | `sk-d8715dc96a2b4380b6181052dbc47e0b` |
| `GLM_API_KEY` | `20a513ba925243fda8600adfcdfd09d1.urwef1IdUCnD6Gpl` |
| `KIMI_API_KEY` | `sk-3Rww1ag6WE8ttxJVSTTAXmsY1PrGiAUSGqu99KTIN2mBjTjx` |
| `CLIENT_URL` | `https://agentclaw.vercel.app` |

5. 点击 **"Deploy"**
6. 等待部署完成（约 2-3 分钟）
7. 部署成功后，点击 **"Settings" → "Domains"**
8. 复制生成的域名，类似 `codeclaw-production.up.railway.app`

---

## 第五步：部署前端到 Vercel

### 5.1 注册 Vercel

1. 打开 https://vercel.com/signup
2. 用 GitHub 账号登录

### 5.2 导入项目

1. 点击 **"Add New Project"**
2. 选择你的 `agentclaw` GitHub 仓库
3. **Root Directory**: 输入 `client`
4. 点击 **"Environment Variables"**，添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://YOUR_RAILWAY_DOMAIN`（第四步复制的域名） |

5. 点击 **"Deploy"**
6. 等待部署完成（约 1-2 分钟）

### 5.3 配置自定义域名（可选）

1. 部署完成后，点击 **"Domains"**
2. 输入你想要的域名，如 `agentclaw.vercel.app`
3. 或者绑定自己的域名

---

## 第六步：验证部署

1. 打开 Vercel 给你的前端 URL
2. 测试 Chat 功能，选择 DeepSeek 或 GLM-4 模型
3. 如果返回结果，说明部署成功！

---

## 常见问题

### Q: Railway 部署失败？
- 检查 `server/Dockerfile` 是否存在
- 检查环境变量是否全部设置
- 查看 Railway Logs 获取详细错误

### Q: 前端无法连接后端？
- 确认 `VITE_API_BASE_URL` 设置正确
- 确认 Railway 服务已启动（看 Domains 页面是否有 URL）
- 检查浏览器 Console 的 CORS 错误

### Q: API 返回 401/403？
- 检查 API Key 是否正确
- Kimi 可能欠费，先用 DeepSeek 或 GLM-4 测试

---

## 部署完成后的下一步

1. **注册 Stripe**（https://stripe.com）获取支付密钥
2. 在 Railway 添加 Stripe 环境变量
3. 在 Vercel 重新部署前端
4. 准备 Product Hunt 发布（见 `LAUNCH.md`）

---

🎉 **恭喜你！AgentClaw 现在上线了！**
