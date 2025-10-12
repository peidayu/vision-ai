# Vision AI 项目结构说明

## 📁 项目目录结构

```
src/
├── components/              # React 组件
│   ├── ImageUploadArea.jsx # 图片上传区域组件
│   ├── ResultDisplay.jsx   # 结果展示组件
│   ├── ConfigPanel.jsx     # 配置面板组件
│   └── ui/                 # UI 基础组件库
│
├── store/                  # Zustand 状态管理
│   └── useAppStore.js      # 全局应用状态
│
├── services/               # 业务逻辑服务
│   └── aiService.js        # AI 模型调用服务
│
├── constants/              # 常量配置
│   └── providers.js        # 服务商配置常量
│
├── lib/                    # 工具函数
│   └── utils.js            # 通用工具函数
│
└── App.js                  # 应用主入口
```

## 🏗️ 架构设计

### 1. 状态管理 (Zustand)

使用 Zustand 进行集中式状态管理，优势：

- ✅ 轻量级（~1KB）
- ✅ 无需 Provider 包裹
- ✅ 直观的 API
- ✅ 支持 TypeScript
- ✅ 开发工具友好

**状态结构：**

```javascript
{
  selectedFiles: [],      // 选中的图片文件
  output: "",            // 识别输出结果
  config: {},            // 实际使用的配置
  formConfig: {},        // 表单临时配置
}
```

### 2. 组件拆分

#### ImageUploadArea (图片上传区域)

- 负责图片拖拽上传
- 展示上传的图片
- 触发图片识别处理
- 清空图片功能

#### ResultDisplay (结果展示)

- 展示 AI 识别结果
- 支持流式输出
- 滚动查看长文本

#### ConfigPanel (配置面板)

- 提示词配置
- 模型服务商选择
- API 密钥管理
- 模型名称配置
- 配置保存功能

### 3. 服务层

#### aiService.js

封装 AI 模型调用逻辑：

- `createModel()` - 创建模型实例
- `processImage()` - 处理图片识别

优势：

- 业务逻辑与组件分离
- 易于测试和维护
- 可复用性高

### 4. 常量管理

#### providers.js

集中管理服务商配置：

- OpenAI
- Qwen 通义千问
- 智谱 AI
- 默认提示词

## 🔄 数据流

```
用户操作 → 组件触发
    ↓
Zustand Store 状态更新
    ↓
服务层调用 (aiService)
    ↓
Store 更新结果
    ↓
组件自动重新渲染
```

## 💡 优化点

### 相比原版的改进：

1. **代码可维护性**

   - 单一职责原则：每个组件只负责一个功能
   - 300+ 行代码拆分为多个 50-150 行的小文件
   - 逻辑清晰，易于理解

2. **状态管理**

   - 使用 Zustand 替代多个 useState
   - 避免 props drilling
   - 状态逻辑集中管理

3. **代码复用**

   - 服务层可在多处复用
   - 常量统一管理，便于修改

4. **可扩展性**

   - 新增功能只需添加对应模块
   - 不影响现有代码

5. **测试友好**
   - 组件、服务、状态独立
   - 易于编写单元测试

## 🚀 使用说明

### 状态访问

```javascript
import useAppStore from "./store/useAppStore";

function MyComponent() {
  const { output, setOutput } = useAppStore();
  // ...
}
```

### 添加新服务商

在 `constants/providers.js` 中添加：

```javascript
export const PROVIDER_CONFIGS = {
  // ...
  newProvider: {
    name: "新服务商",
    baseURL: "https://api.example.com",
    defaultModel: "model-name",
  },
};
```

### 扩展功能

1. 在 `store/useAppStore.js` 添加新状态
2. 在 `services/` 添加新服务
3. 在 `components/` 创建新组件
4. 在 `App.js` 中组合使用

## 📦 依赖

- **zustand** - 状态管理
- **react-dropzone** - 文件拖拽上传
- **ai** - AI SDK
- **@ai-sdk/openai-compatible** - OpenAI 兼容接口

## 🎯 未来优化建议

1. 添加 TypeScript 支持
2. 实现提示词模板管理
3. 添加历史记录功能
4. 支持批量图片处理
5. 添加导出功能（复制、下载）
6. 实现配置测试功能
7. 添加错误边界和错误提示
8. 支持更多图片格式
9. 添加图片预处理选项
10. 实现暗色模式
