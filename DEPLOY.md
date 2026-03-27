# Vercel部署配置

## 部署步骤

### 1. 前端 - Vercel
```bash
# 安装Vercel CLI
npm i -g vercel

# 在client目录部署
cd token-platform/client
vercel --prod
```

### 2. 后端 - Railway 或 Render
```bash
# Railway部署 (推荐，免费起步)
# 1. 注册 railway.app
# 2. 连接GitHub仓库
# 3. 设置环境变量 (见 .env.example)
```

### 3. 环境变量配置
需要在部署平台设置以下变量：
- DEEPSEEK_API_KEY: 去 platform.deepseek.com 申请
- GLM_API_KEY: 去 open.bigmodel.cn 申请
- KIMI_API_KEY: 去 platform.moonshot.cn 申请
- STRIPE_SECRET_KEY: 去 stripe.com 申请
- JWT_SECRET: 随机字符串

## 获取API Keys（成本估算）
| 平台 | 注册地址 | 免费额度 |
|------|---------|---------|
| DeepSeek | platform.deepseek.com | $5 |
| 智谱GLM | open.bigmodel.cn | 5M tokens |
| Kimi月之暗面 | platform.moonshot.cn | 15元 |

## 域名建议
- codeclaw.ai ($10-15/年)
- 或 cheapclaude.com
- 或 devtokens.io
