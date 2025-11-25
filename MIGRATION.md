# 迁移到 Vite 完成

项目已成功从 Next.js 迁移到 Vite。

## 主要变更

### 1. 项目结构
- ✅ 从 `app/` 目录改为 `src/` 目录
- ✅ 创建了 `src/pages/` 用于页面组件
- ✅ 移动了 `components/` 和 `lib/` 到 `src/` 下

### 2. 路由系统
- ✅ 从 Next.js App Router 改为 React Router v6
- ✅ 路由配置在 `src/App.tsx` 中

### 3. 移除的 Next.js 特性
- ✅ 移除所有 `"use client"` 指令
- ✅ `Image` 组件替换为普通 `<img>` 标签
- ✅ `Link` 组件替换为 React Router 的 `Link`
- ✅ `usePathname` 替换为 `useLocation`
- ✅ 移除 Next.js 字体优化（改用 Google Fonts CDN）
- ✅ 移除 Next.js metadata 系统（改用 index.html）

### 4. 构建工具
- ✅ 从 Next.js 改为 Vite
- ✅ 创建了 `vite.config.ts`
- ✅ 创建了 `index.html` 作为入口文件
- ✅ 更新了 `tsconfig.json` 以适配 Vite

## 如何运行

### 1. 安装依赖
```bash
pnpm install
```

### 2. 开发模式
```bash
pnpm dev
```
应用将在 http://localhost:3000 启动

### 3. 构建生产版本
```bash
pnpm build
```

### 4. 预览生产版本
```bash
pnpm preview
```

## 注意事项

1. 所有路径别名 `@/` 仍然可用，指向 `src/` 目录
2. 所有环境变量需要以 `VITE_` 开头才能在客户端访问
3. public 目录下的静态资源可以直接通过 `/` 访问
4. 开发服务器默认端口为 3000，可在 vite.config.ts 中修改

## 已保留的功能

- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ next-themes（主题切换，此库不依赖 Next.js）
- ✅ Radix UI 组件
- ✅ 所有业务逻辑和数据处理
- ✅ 本地存储功能
- ✅ TTS 语音功能
- ✅ 键盘快捷键

## 可能需要的额外调整

如果遇到任何导入错误或类型错误，可能需要：
1. 确保所有依赖都已安装
2. 重启开发服务器
3. 清除 node_modules 并重新安装

