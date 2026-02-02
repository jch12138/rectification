# 部署到 Vercel 指南

本项目已经配置好支持 Vercel 一键部署。由于 Vercel 是 Serverless 环境，不支持 SQLite 数据库持久化，因此本配置会自动将数据库切换为 **Vercel Postgres**。

## 快速部署步骤

1. **推送到 GitHub**
   将本项目代码推送到你的 GitHub 仓库。

2. **在 Vercel 中导入项目**
   - 访问 [Vercel Dashboard](https://vercel.com/new)。
   - 选择并导入刚才推送的 GitHub 仓库。

3. **配置数据库 (关键步骤)**
   - 在 Vercel 的部署页面（或者部署完成后在项目控制台）：
   - 点击 **Storage** 选项卡。
   - 点击 **Create** -> **Postgres** -> **Continue**。
   - 接受条款并创建数据库。
   - **重要**：在创建完成后，点击 **Connect Project**，选择刚才部署的项目。这会自动添加所有必要的环境变量（`POSTGRES_PRISMA_URL` 等）。

4. **重新部署**
   - 如果你在第一次部署时还没有连接数据库，部署可能会失败。
   - 连接数据库后，去 **Deployments** 选项卡，点击最近一次失败部署的三个点 -> **Redeploy**。
   - 此时，构建脚本会自动检测到 Vercel 环境，将 Prisma 配置从 SQLite 切换到 Postgres，并初始化数据库表结构。

## 详细说明

为了实现自动化部署，本项目包含以下特殊配置：

- **`vercel.json`**: 指定了自定义构建命令 `npm run vercel-build`。
- **`scripts/vercel-deploy.js`**: 这是一个自动化脚本，仅在 Vercel 构建过程中运行。它会将 `prisma/schema.prisma` 中的 `sqlite` 替换为 `postgresql`，并配置 Vercel Postgres 的连接参数。
- **`package.json`**: 包含 `vercel-build` 命令，执行顺序为：修改 Schema -> 生成 Client -> 同步数据库结构 -> 构建 Next.js 应用。

> **注意**：本地开发依然使用 SQLite (`dev.db`)，互不影响。
