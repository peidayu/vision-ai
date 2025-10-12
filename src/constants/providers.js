// 预置的服务商配置
export const PROVIDER_CONFIGS = {
  test: {
    name: "测试服务",
    baseURL: "https://api-inference.modelscope.cn/v1",
    apiKey: "ms-1f83ddba-1fd4-48bf-8a35-06be74754366",
    defaultModel: "Qwen/Qwen3-VL-235B-A22B-Instruct",
  },
  openai: {
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4-vision-preview",
  },
  // qwen: {
  //   name: "Qwen 通义千问",
  //   baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  //   defaultModel: "qwen-vl-max",
  // },
  zhipu: {
    name: "智谱AI",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "GLM-4V-Flash",
  },
};

export const DEFAULT_PROMPT =
  "你是一个专业的OCR工具，请返回图片里的文字内容，除了内容不返回任何东西。注意需要保留文字的排版信息。";
