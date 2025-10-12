#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 文件路径
const sourceCodePath = path.join(__dirname, "../src/lib/sourceCode.js");
const escapedCodePath = path.join(__dirname, "../src/lib/escapedCode.js");

// 读取 sourceCode.js 的内容
console.log("正在读取 sourceCode.js...");
const sourceCode = fs.readFileSync(sourceCodePath, "utf-8");

// 转义内容：将特殊字符转义，包括换行符
// 使用 JSON.stringify 可以自动处理所有转义
const escapedCode = JSON.stringify(sourceCode);

fs.writeFileSync(
  escapedCodePath,
  `export const escapedCode = ${escapedCode};`,
  "utf-8"
);

console.log("✅ 转义代码已保存到 escapedCode.js 文件");
