# 代码更新脚本

## 功能说明

`updateCode.js` 脚本用于自动将 `src/lib/sourceCode.js` 的内容转义后更新到 `src/lib/getCode.js` 的 `baseCode` 变量中。

## 使用方法

### 方法 1: 使用 npm 命令（推荐）

```bash
npm run update-code
```

### 方法 2: 直接运行脚本

```bash
node scripts/updateCode.js
```

## 工作原理

1. 读取 `src/lib/sourceCode.js` 文件的完整内容
2. 使用 `JSON.stringify()` 对内容进行转义处理（包括换行符、引号、反斜杠等特殊字符）
3. 将转义后的内容赋值给 `baseCode` 常量
4. 将更新后的内容写入 `src/lib/getCode.js` 文件

## 何时使用

每次修改 `src/lib/sourceCode.js` 文件后，运行此脚本来同步更新 `getCode.js` 文件。

## 注意事项

- 脚本会完全覆盖 `getCode.js` 文件的内容
- 确保 `sourceCode.js` 文件格式正确后再运行脚本
- 脚本执行成功后会显示绿色的 ✅ 标记和相关文件路径
