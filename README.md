# 整改跟踪系统 (Rectification Tracking System)

本项目是一个基于 Next.js + Prisma + SQLite 的整改任务跟踪系统，旨在帮助管理员高效分发整改任务，并让各县市用户方便地查看和反馈整改情况。

## 🛠 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **语言**: TypeScript
- **数据库**: SQLite (通过 Prisma ORM 管理)
- **样式**: Tailwind CSS
- **工具**: XLSX (Excel 导入导出)

## 🚀 快速开始 (开发环境)

### 1. 环境准备
确保您的本地环境已安装：
- [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)
- npm (Node.js 安装包通常自带)

### 2. 安装依赖
在项目根目录下执行：
```bash
npm install
```

### 3. 数据库初始化
本项目默认使用本地 SQLite 数据库 (`prisma/dev.db`)。首次运行前需初始化数据库结构：

```bash
# 1. 生成 Prisma Client 代码
npx prisma generate

# 2. 将 Schema 同步到数据库文件 (自动创建 dev.db)
npx prisma db push
```

### 4. 初始化管理员账号
执行内置脚本创建一个默认的管理员账号：
- **用户名**: `admin`
- **密码**: `admin`

```bash
node prisma/seed.js
```

### 5. 启动开发服务器
```bash
npm run dev
```

启动成功后，访问浏览器：[http://localhost:3000](http://localhost:3000)

---

## 📖 使用指南

### 登录系统
访问 `/login` 页面。
- **管理员**: 使用 `admin/admin` 登录，进入后台管理。
- **普通用户**: 使用管理员创建的账号登录，自动跳转至所属县市的任务批次列表。

### 管理员功能 (`/admin`)
1.  **批量导入**: 上传 Excel 文件导入整改任务，支持自定义列映射（如指定哪一列是“县市”）。
2.  **任务管理**: 查看所有批次，删除误导的批次，或导出特定批次的数据。
3.  **用户管理**: 创建各县市的普通用户账号（需绑定具体的县市名称，如“北京”）。
4.  **数据导出**: 支持导出全部数据或按批次导出 Excel。

### 普通用户功能
1.  **批次选择**: 登录后查看相关的任务批次及完成进度。
2.  **任务反馈**: 点击进入任务列表，查看具体问题并提交整改反馈（支持文字和图片）。
3.  **数据导出**: 可导出当前所属县市的任务数据。

---

## 🐳 Docker 部署指南

### 1. 构建镜像
在项目根目录下执行：
```bash
docker build -t rectification-system .
```

### 2. 准备数据目录
在宿主机上创建一个目录用于存放 SQLite 数据库文件，防止容器重启后数据丢失。
```bash
mkdir -p $(pwd)/data
# 确保该目录有写权限
chmod 777 $(pwd)/data
```

### 3. 启动容器
```bash
docker run -d \
  --name rectification-app \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  rectification-system
```
> **注意**: 数据库文件将存储在容器内的 `/app/data/dev.db`（映射到宿主机的 `./data/dev.db`）。请勿直接挂载 `/app/prisma`，以免覆盖代码中的 Schema 文件。

### 4. 首次运行初始化
如果宿主机的挂载目录是空的（第一次部署），容器启动后可能需要手动初始化数据库：
```bash
# 进入容器
docker exec -it rectification-app sh


docker exec -it rectification-app npx prisma@5.22.0 generate

docker exec -it rectification-app npx prisma@5.22.0 db push
# 在容器内执行（生成 dev.db）
npx prisma db push
npx prisma@5.22.0 db push

# 初始化管理员账号
node prisma/seed.js

# 退出容器
exit
```

### 5. 访问系统
访问宿主机 IP 的 3000 端口：`http://localhost:3000`

## 📦 部署说明 (生产环境 - 传统方式)

### 1. 构建项目
```bash
npm run build
```

### 2. 启动服务
```bash
npm start
```
服务默认运行在 `3000` 端口。您可以使用 PM2 或 Docker 来守护进程。

### 3. ⚠️ 重要：数据持久化 (传统部署)
由于本项目使用 SQLite 文件数据库 (`prisma/dev.db`)：
- **Docker 部署**: 请参考上方的 Docker 部署指南，务必挂载 `/app/prisma` 目录。
- **生产数据库**: 如果数据量较大或需要更高并发，建议切换到 PostgreSQL 或 MySQL。
    1. 修改 `.env` 文件中的 `DATABASE_URL`。
    2. 修改 `prisma/schema.prisma` 中的 `provider` 为 `postgresql` 或 `mysql`。
    3. 重新执行 `npx prisma db push`。

## 🛠 常用维护命令

- **查看/管理数据库**:
    ```bash
    npx prisma studio
    ```
    这会打开一个网页版数据库管理器，方便直接查看和修改数据。

- **Schema 变更后更新**:
    如果修改了 `prisma/schema.prisma` 文件，必须执行：
    ```bash
    npx prisma generate
    ```
    并重启开发服务器。
