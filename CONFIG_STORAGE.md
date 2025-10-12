# 配置存储说明

## 📦 服务端存储

应用配置已从 localStorage 升级为服务端存储，支持跨设备同步。

## 🔧 配置 ViewId

### 方法 1: 环境变量（推荐）

```javascript
// 在 env.js 或初始化脚本中设置
window.env = {
  viewId: "your-view-id-here",
};
```

### 方法 2: URL 参数

```
https://your-app.com/?viewId=68cdfd9a646f5f797f3e1945
```

### 方法 3: 修改默认值

编辑 `src/services/configApi.js`：

```javascript
// 默认 viewId（根据实际情况修改）
return "68cdfd9a646f5f797f3e1945";
```

## 📡 API 调用

### 保存配置

```javascript
await window.api.call("plugin", "stateSave", {
  viewId: "68cdfd9a646f5f797f3e1945",
  data: {
    provider: "openai",
    apiKey: "sk-xxx",
    // ... 其他配置
  },
});
```

### 读取配置

```javascript
const response = await window.api.call("plugin", "stateRead", {
  viewId: "68cdfd9a646f5f797f3e1945"
});

// 返回格式
{
  "data": {
    "provider": "openai",
    "apiKey": "sk-xxx",
    // ... 其他配置
  },
  "metadata": {
    "created_at": "2025-10-12 15:13:00",
    "updated_at": "2025-10-12 15:14:56"
  }
}
```

## 🔄 降级策略

应用实现了智能降级：

1. **首选**：服务端 API 存储
2. **降级**：localStorage 本地存储

### 降级场景

- API 不可用时
- 网络请求失败时
- 服务端返回错误时

## 🎯 使用流程

### 保存流程

```
用户点击保存
    ↓
检查 API 是否可用
    ↓
是 → 调用服务端 API
    ↓
成功 ✅
    ↓
失败 → 降级到 localStorage ⚠️
```

### 加载流程

```
应用启动
    ↓
检查 API 是否可用
    ↓
是 → 尝试从服务端加载
    ↓
成功 ✅ → 使用服务端配置
    ↓
失败 → 降级到 localStorage ⚠️
```

## 🛡️ 错误处理

### 保存失败

```javascript
try {
  await saveConfig();
  toast.success("配置已保存");
} catch (error) {
  toast.error("配置保存失败，请重试");
}
```

### 加载失败

- 自动降级到 localStorage
- 控制台输出错误信息
- 不影响应用正常使用

## 🔍 调试

### 检查 API 是否可用

```javascript
console.log("API 可用:", typeof window.api !== "undefined");
```

### 查看当前 viewId

```javascript
// 在浏览器控制台
console.log(
  "当前 viewId:",
  window.env?.viewId ||
    new URLSearchParams(window.location.search).get("viewId")
);
```

### 查看保存的配置

```javascript
// 服务端
const config = await window.api.call("plugin", "stateRead", {
  viewId: "your-view-id",
});
console.log("服务端配置:", config);

// 本地
console.log("本地配置:", localStorage.getItem("visionAIConfig"));
```

## 📊 数据格式

### 保存的配置结构

```javascript
{
  provider: "openai",      // 服务商
  baseURL: "https://...",  // 服务地址
  apiKey: "sk-xxx",        // API 密钥
  modelName: "gpt-4",      // 模型名称
  prompt: "你是..."        // 提示词
}
```

## 🚀 优势

✅ **跨设备同步** - 在不同设备上使用相同配置  
✅ **数据持久化** - 配置永久保存在服务端  
✅ **版本管理** - 服务端记录创建和更新时间  
✅ **可靠降级** - API 不可用时自动使用本地存储  
✅ **无缝迁移** - 自动从 localStorage 迁移到服务端

## 🔒 安全性

- API 密钥存储在服务端
- 使用 HTTPS 加密传输
- ViewId 作为访问控制
- 支持自定义存储位置

## 💡 最佳实践

1. **生产环境**：使用环境变量配置 viewId
2. **开发环境**：使用 URL 参数方便调试
3. **错误监控**：关注控制台错误日志
4. **定期备份**：重要配置建议导出备份
