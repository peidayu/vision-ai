import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { resizeImage, buildStructuredPrompt } from "../lib/utils";
import { config } from "mdye";

/**
 * 创建 AI 模型实例
 */
export const createModel = (apiKey, baseURL) => {
  return createOpenAICompatible({
    apiKey,
    baseURL,
  });
};

/**
 * 处理图片识别
 * @param {Object} options - 配置选项
 * @param {File} options.file - 图片文件
 * @param {Object} options.config - AI 配置
 * @param {Function} options.onTextUpdate - 文本更新回调
 * @param {boolean} options.stream - 是否使用流式输出，默认 true
 */
export const processImage = async ({
  file,
  config: aiConfig,
  onTextUpdate,
  stream = true,
}) => {
  try {
    // 压缩图片并转换为 base64（最大 1280px，保持宽高比）
    const base64Str = await resizeImage(file, 1280, 0.9);

    // 创建模型实例
    const modelInstance = createModel(aiConfig.apiKey, aiConfig.baseURL);

    // 根据是否启用结构化输出，动态生成 Prompt
    let systemPrompt = aiConfig.prompt;
    if (aiConfig.structuredOutput && aiConfig.fieldMappings?.length > 0) {
      // 构建字段映射，供 buildStructuredPrompt 使用
      const controlsMap = {};
      config.controls.forEach((control) => {
        controlsMap[control.controlId] = control;
      });
      systemPrompt = buildStructuredPrompt(
        aiConfig.prompt,
        aiConfig.fieldMappings,
        controlsMap
      );
    }

    // 调用 AI 进行识别
    const { textStream } = streamText({
      model: modelInstance(aiConfig.modelName),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: base64Str,
            },
          ],
        },
      ],
    });

    if (stream) {
      // 流式输出结果
      for await (const textPart of textStream) {
        onTextUpdate(textPart);
      }
    } else {
      // 非流式输出，等待全部结果
      let fullText = "";
      for await (const textPart of textStream) {
        fullText += textPart;
      }
      onTextUpdate(fullText);
    }
  } catch (error) {
    console.error("图片识别失败:", error);
    throw error;
  }
};
