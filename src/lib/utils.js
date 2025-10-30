import { clsx } from "clsx";
import { includes } from "lodash";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 压缩图片到指定最大尺寸，保持宽高比
 * @param {File} file - 图片文件
 * @param {number} maxSize - 最大边长（默认 1280px）
 * @param {number} quality - 图片质量（0-1，默认 0.9）
 * @returns {Promise<string>} base64 字符串
 */
export function resizeImage(file, maxSize = 1280, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 计算缩放后的尺寸
        let width = img.width;
        let height = img.height;

        // 如果图片已经小于最大尺寸，直接返回原图
        if (width <= maxSize && height <= maxSize) {
          resolve(e.target.result);
          return;
        }

        // 计算缩放比例，保持宽高比
        if (width > height) {
          // 宽度大于高度，以宽度为准
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          // 高度大于宽度，以高度为准
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        // 创建 canvas 进行压缩
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // 使用更好的图片质量算法
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 base64（保持原格式或使用 jpeg）
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const base64 = canvas.toDataURL(mimeType, quality);

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    reader.readAsDataURL(file);
  });
}

export const toast = {
  success: (message) => {
    window.callMdUtil("alert", { msg: message, type: 1 });
  },
  error: (message) => {
    window.callMdUtil("alert", { msg: message, type: 2 });
  },
  warning: (message) => {
    window.callMdUtil("alert", { msg: message, type: 3 });
  },
};

export const controlState = (control) => {
  if (!control) {
    return {};
  }
  const controlPermissions = control.controlPermissions || "111";
  const fieldPermission = control.fieldPermission || "111";
  let state = {
    visible: true,
    editable: true,
  };

  state.visible = fieldPermission[0] === "1" && controlPermissions[0] === "1";
  state.editable = fieldPermission[1] === "1" && controlPermissions[1] === "1";

  return state;
};

/**
 * 从文本中提取 JSON
 * 支持多种格式：JSON 代码块、分隔符、纯 JSON
 */
export function extractJSON(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  // 策略 1: 提取 ```json ... ``` 代码块
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      console.warn("JSON 代码块解析失败:", e);
    }
  }

  // 策略 2: 提取 ``` ... ``` 通用代码块（可能是 JSON）
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      console.warn("通用代码块解析失败:", e);
    }
  }

  // 策略 3: 提取分隔符内容
  const separatorMatch = text.match(/===START_JSON===([\s\S]*?)===END_JSON===/);
  if (separatorMatch) {
    try {
      return JSON.parse(separatorMatch[1].trim());
    } catch (e) {
      console.warn("分隔符内容解析失败:", e);
    }
  }

  // 策略 4: 查找第一个 { 到最后一个 } 的内容
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    try {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("大括号提取解析失败:", e);
    }
  }

  // 策略 5: 直接尝试解析整个文本
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    console.warn("直接解析失败:", e);
  }

  return null;
}

/**
 * 修复常见的 JSON 格式错误
 */
export function fixJSONString(str) {
  if (!str) return str;

  return str
    .replace(/,\s*}/g, "}") // 移除尾随逗号
    .replace(/,\s*]/g, "]")
    .replace(/\/\/.*/g, "") // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, ""); // 移除多行注释
}

/**
 * 根据字段映射配置生成结构化 Prompt
 * @param {string} basePrompt - 基础提示词
 * @param {Array} fieldMappings - 字段映射配置
 * @param {Object} controlsMap - 字段 ID 到字段信息的映射
 */
export function buildStructuredPrompt(
  basePrompt,
  fieldMappings,
  controlsMap = {}
) {
  if (!fieldMappings || fieldMappings.length === 0) {
    return basePrompt;
  }

  // 构建字段说明（使用 controlId 作为 JSON 键名）
  const fieldDescriptions = fieldMappings
    .filter((m) => m.controlId) // 只包含已选择字段的映射
    .map((m) => {
      const controlName = controlsMap[m.controlId]?.controlName || m.controlId;
      let description = m.description || controlName;
      const isOptions = includes([9, 10, 11], controlsMap[m.controlId]?.type);
      if (isOptions) {
        description =
          description +
          `  请从以下选项中选择，数组形式返回选中的key，值是序列化后的字符串，比如 '["********-****-****-****-************"]' ，数组内是 uuid。options: ${controlsMap[
            m.controlId
          ]?.options
            .map((o) => `key:${o.key}, text:${o.value}`)
            .join(", ")}`;
      }
      return `- ${m.controlId}（${controlName}）：${description}`;
    })
    .join("\n");

  // 构建示例 JSON（使用 controlId 作为键名）
  const exampleJSON = {};
  fieldMappings
    .filter((m) => m.controlId)
    .forEach((m) => {
      const controlName = controlsMap[m.controlId]?.controlName || "值";
      exampleJSON[m.controlId] = `识别到的${controlName}`;
    });

  // 组合完整 Prompt（要求以 JSONL 流式逐行输出）
  const jsonlExampleLines = Object.keys(exampleJSON)
    .map((key) => `{"key":"${key}","value":"${exampleJSON[key]}"}`)
    .join("\n");

  return `${basePrompt}

请按照以下结构返回识别结果（流式逐字段返回）：

字段说明：
${fieldDescriptions}

返回格式（请在 jsonl 代码块中返回，按行输出）：
\`\`\`jsonl
${jsonlExampleLines}
\`\`\`

严格要求：
1. 必须使用 \`\`\`jsonl 代码块包裹内容
2. 代码块内每一行都是一个完整 JSON 对象，形如 {"key":"字段ID","value":"字段值"}
3. 每一行对象仅包含 key 与 value 两个属性
4. 每一行结尾使用单个换行分隔；对象内部务必不要换行
5. 仅输出已识别到的字段；无法识别的字段不要输出
6. 字段ID必须严格使用以上列出的 controlId`;
}

/**
 * 生成唯一 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 将 label 转换为 jsonKey（驼峰命名或下划线命名）
 */
export function labelToJsonKey(label, style = "snake_case") {
  if (!label) return "";

  // 移除特殊字符，只保留中英文和数字
  const cleaned = label.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, "");

  // 转为拼音或英文（这里简化处理，实际可以引入拼音库）
  // 简单实现：如果是中文，用拼音首字母代替（这里先用简单映射）
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (style === "snake_case") {
    return words.join("_").toLowerCase();
  } else if (style === "camelCase") {
    return words
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  return cleaned.replace(/\s+/g, "_").toLowerCase();
}
