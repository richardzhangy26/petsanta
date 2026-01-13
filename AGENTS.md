# AI 代理开发指南 - Pets Santa

本文档为在此代码库中工作的 AI 代理提供关键指南。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5 (严格模式)
- **UI**: React 19 + Tailwind CSS 4
- **认证**: Better Auth
- **数据库**: PostgreSQL + Drizzle ORM
- **支付**: Stripe
- **UI 组件**: Radix UI (带 shadcn/ui 风格)

## 构建和测试命令

```bash
# 开发
npm run dev              # 启动开发服务器 (Turbopack)

# 构建
npm run build            # 生产构建 (Turbopack)
npm run start            # 启动生产服务器

# 代码质量
npm run lint             # 运行 ESLint

# 数据库
npm run db:generate      # 生成 Drizzle 迁移
npm run db:migrate       # 推送迁移到数据库
npm run db:studio        # 打开 Drizzle Studio

# 测试
# 当前项目未配置测试框架。如需添加测试,推荐使用 Vitest
```

## 代码风格指南

### 导入组织

- 使用绝对路径别名: `@/` 映射到 `./src/`
- 示例: `import { db } from "@/db"` 而非 `import { db } from "../../db"`
- 第三方包导入在顶部,项目内部导入在下方

```typescript
// ✅ 正确
import React, { useState } from "react";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

// ❌ 错误
import { auth } from "../../lib/auth/server";
import React from "react";
```

### 组件模式

- **客户端组件**: 必须在文件顶部使用 `'use client';` 指令
- **类型定义**: 使用 `React.FC` 或函数参数类型

```typescript
'use client';

import React from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};

export default MyComponent;
```

### 样式规范

- 使用 `cn()` 工具函数合并类名 (来自 `@/lib/utils`)
- 使用 `class-variance-authority` (CVA) 管理 UI 组件变体
- Tailwind CSS 类名通过 Prettier 插件自动排序

```typescript
import { cn } from "@/lib/utils";

// ✅ 正确
<div className={cn("base-class", isActive && "active-class", className)}>

// ❌ 错误
<div className="base-class isActive ? 'active-class' : ''">
```

### 类型安全

- **禁止**: 使用 `as any`、`@ts-ignore`、`@ts-expect-error` 压制类型错误
- Drizzle schema 使用 `.inferSelect` / `.inferInsert` 生成类型

```typescript
// ✅ 正确 - 从 schema 推断类型
import { user } from "@/db/schema/auth/user";
export type UserType = typeof user.$inferSelect;

// ❌ 错误
type User = any;
```

### 错误处理

- API 路由使用 try/catch 并返回适当的 HTTP 状态码
- 记录错误到控制台但不泄露敏感信息

```typescript
export async function POST() {
  try {
    // 业务逻辑
    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
```

### 数据库操作

- 使用 Drizzle ORM 查询构建器
- 表定义在 `src/db/schema/` 目录,按功能分组 (auth/, billing/)
- 所有导出类型命名使用 PascalCase (如 `UserType`、`PaymentType`)

```typescript
import { db } from "@/db";
import { user } from "@/db/schema/auth/user";
import { eq } from "drizzle-orm";

const userData = await db.query.user.findFirst({
  where: eq(user.id, userId),
});
```

### 命名约定

- **文件**: kebab-case (`user-profile.tsx`)
- **组件**: PascalCase (`UserProfile`)
- **函数/变量**: camelCase (`getUserData`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **类型/接口**: PascalCase (`UserData`)
- **数据库表**: camelCase (`stripePayments`)

### API 路由

- 使用 App Router 模式: `src/app/api/[route]/route.ts`
- 导出 HTTP 方法函数: `GET`、`POST`、`PUT`、`DELETE`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: "ok" });
}

export async function POST(request: Request) {
  const body = await request.json();
  // 处理逻辑
  return NextResponse.json({ success: true });
}
```

### 认证处理

- 服务端: 从 `@/lib/auth/server` 导入 `auth` 实例
- 客户端: 从 `@/lib/auth/client` 导入 `useSession` hook

```typescript
// 服务端
import { auth } from "@/lib/auth/server";
const session = await auth.api.getSession({ headers: await headers() });

// 客户端
import { useSession } from "@/lib/auth/client";
const { data: session } = useSession();
```

## 项目结构

```
src/
├── app/              # Next.js App Router 页面和 API 路由
│   ├── (routes)/     # 路由组
│   └── api/          # API 端点
├── components/       # React 组件
│   ├── pets-santa/  # 应用特定组件
│   └── ui/          # 通用 UI 组件 (Radix UI)
├── db/               # 数据库相关
│   └── schema/       # Drizzle 表定义
├── lib/              # 工具函数和配置
│   └── auth/         # Better Auth 配置
└── providers/        # React Context 提供者
```

## 重要提醒

1. **类型安全优先**: 绝不使用 `as any` 或注释绕过类型检查
2. **遵循现有模式**: 在添加新功能前,参考相似文件的实现方式
3. **保持一致**: 使用项目的导入路径、组件结构和命名约定
4. **无测试配置**: 项目当前未配置测试,如需添加,请与团队确认测试策略
5. **使用 Turbopack**: 开发和生产构建都使用 Turbopack 加速
