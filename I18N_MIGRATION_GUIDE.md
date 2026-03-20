# Paperclip i18n 迁移指南

本文档说明如何继续为多语言支持添加更多翻译。

## 已实现的功能

- ✅ 基础 i18n 框架 (react-i18next)
- ✅ 自动语言检测 + 持久化
- ✅ 语言切换 UI (Layout 底部)
- ✅ Sidebar 组件翻译
- ✅ Dashboard 页面翻译
- ✅ 日期/时间本地化
- ✅ 相对时间显示本地化

## 文件结构

```
ui/src/i18n/
├── index.ts                 # i18n 配置
└── locales/
    ├── en/                  # 英文翻译
    │   ├── index.ts
    │   ├── common.json      # 通用文本
    │   ├── sidebar.json     # 侧边栏
    │   ├── dashboard.json   # 仪表盘
    │   └── ...
    └── zh/                  # 中文翻译
        └── ... (同上)
```

## 添加新页面翻译的步骤

### 1. 创建/更新翻译文件

在 `ui/src/i18n/locales/en/` 和 `ui/src/i18n/locales/zh/` 中添加新的 JSON 文件。

例如创建 `issues.json`:

```json
{
  "title": "Issues",
  "newIssue": "New Issue"
}
```

### 2. 导出翻译文件

修改 `ui/src/i18n/locales/en/index.ts` 和 `zh/index.ts` 导出新增的文件:

```typescript
import issues from './issues.json';

export default {
  // ... 其他导入
  issues,
};
```

### 3. 在组件中使用翻译

```tsx
import { useTranslation } from 'react-i18next';

export function Issues() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('issues:title')}</h1>
      <button>{t('issues:newIssue')}</button>
    </div>
  );
}
```

### 4. 带参数的翻译

在 JSON 中定义:
```json
{
  "items": "{{count}} items",
  "items_plural": "{{count}} items"
}
```

在代码中使用:
```tsx
<p>{t('issues:items', { count: 5 })}</p>
// 输出: 5 items
```

### 5. 复数支持

i18next 支持单复数自动切换:

```json
{
  "incident_one": "1 incident",
  "incident_other": "{{count}} incidents"
}
```

```tsx
<p>{t('dashboard:incident', { count: data.budgets.activeIncidents })}</p>
```

## 未翻译的页面列表

以下页面仍需要翻译工作:

- [ ] ui/src/pages/Agents.tsx
- [ ] ui/src/pages/AgentDetail.tsx
- [ ] ui/src/pages/Issues.tsx
- [ ] ui/src/pages/IssueDetail.tsx
- [ ] ui/src/pages/Goals.tsx
- [ ] ui/src/pages/GoalDetail.tsx
- [ ] ui/src/pages/Projects.tsx
- [ ] ui/src/pages/ProjectDetail.tsx
- [ ] ui/src/pages/Costs.tsx
- [ ] ui/src/pages/Activity.tsx
- [ ] ui/src/pages/Approvals.tsx
- [ ] ui/src/pages/ApprovalDetail.tsx
- [ ] ui/src/pages/Inbox.tsx
- [ ] ui/src/pages/MyIssues.tsx
- [ ] ui/src/pages/Org.tsx
- [ ] ui/src/pages/OrgChart.tsx
- [ ] ui/src/pages/CompanySettings.tsx
- [ ] ui/src/pages/InstanceSettings.tsx
- [ ] ui/src/pages/PluginManager.tsx
- [ ] ui/src/pages/PluginSettings.tsx
- [ ] ui/src/pages/Auth.tsx
- [ ] 以及所有对话框组件 (NewIssueDialog, NewProjectDialog, etc.)

## 最佳实践

1. **命名空间**: 按页面/功能组织翻译文件，如 `dashboard.json`, `issues.json`

2. **键名**: 使用 `camelCase`，如 `newIssue`, `agentsEnabled`

3. **嵌套**: 相关文本可以嵌套，如:
   ```json
   {
     "welcome": {
       "title": "Welcome",
       "action": "Get Started"
     }
   }
   ```
   使用时: `t('dashboard:welcome.title')`

4. **复数**: 始终提供 `_one` 和 `_other` (或 `_plural`) 形式

5. **语言切换**: 已自动保存到 localStorage，刷新页面后保持

## 从上游更新

当上游项目有更新时，建议的工作流程:

1. 添加 upstream remote:
   ```bash
   git remote add upstream https://github.com/original/paperclip.git
   ```

2. 获取上游更新:
   ```bash
   git fetch upstream
   ```

3. 合并到主分支:
   ```bash
   git checkout master
   git merge upstream/master
   ```

4. 解决冲突（如果有新添加的硬编码文本，需要添加到翻译文件）

5. 运行类型检查:
   ```bash
   pnpm -r typecheck
   ```

## 调试技巧

在浏览器控制台查看当前语言和已加载的翻译:

```javascript
// 查看当前语言
i18n.language

// 查看所有资源
i18n.getResourceBundle('zh', 'translation')

// 切换语言
i18n.changeLanguage('zh')
```
