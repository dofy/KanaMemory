# 🎉 迁移完成！接下来的步骤

## 1. 安装依赖

由于 package.json 已经更新，你需要重新安装依赖：

```bash
pnpm install
```

## 2. 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3000 启动

## 3. 验证功能

请测试以下功能确保一切正常：

- [ ] 主页显示正常
- [ ] 假名学习页面工作正常
- [ ] 单词学习页面工作正常
- [ ] 句子学习页面工作正常
- [ ] 主题切换（亮色/暗色/系统）正常
- [ ] 语音朗读功能正常
- [ ] 本地存储进度正常
- [ ] 键盘快捷键正常

## 4. 构建生产版本

当你准备好部署时：

```bash
pnpm build
```

构建产物将在 `dist/` 目录中。

## 5. 预览生产版本

```bash
pnpm preview
```

## 常见问题

### Q: 如果遇到类型错误怎么办？
A: 尝试重启你的 IDE/编辑器，或者运行 `pnpm install` 重新安装依赖。

### Q: 开发服务器端口被占用
A: 在 `vite.config.ts` 中修改 `server.port` 配置。

### Q: 样式没有生效
A: 确保 Tailwind CSS 的 content 路径配置正确（已在 tailwind.config.ts 中配置）。

### Q: 图片加载失败
A: 确保图片路径是从 public 目录开始的绝对路径（如 `/images/favicon.png`）。

## 注意事项

1. **环境变量**: 如果你有环境变量，需要以 `VITE_` 开头才能在客户端访问
2. **路径别名**: `@/` 别名仍然指向 `src/` 目录
3. **字体**: 已使用 Google Fonts CDN 引入字体，可在 index.html 中修改
4. **主题**: next-themes 库不依赖 Next.js，可以继续使用

## 部署建议

### Vercel
```bash
# 构建命令
pnpm build

# 输出目录
dist
```

### Netlify
```bash
# 构建命令
pnpm build

# 发布目录
dist
```

### GitHub Pages
添加 `base` 配置到 `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

---

如有任何问题，请查看 MIGRATION.md 了解详细的迁移内容。

