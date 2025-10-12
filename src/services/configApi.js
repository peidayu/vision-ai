import { config as mdyeConfig } from "mdye";
/**
 * 配置存储 API 服务
 * 使用服务端 API 保存和读取配置
 */

/**
 * 保存配置到服务端
 * @param {Object} config - 配置对象
 * @returns {Promise<void>}
 */
export const saveConfigToServer = async (config) => {
  try {
    const viewId = mdyeConfig.viewId;

    // 序列化复杂类型（数组、对象、布尔值）为字符串
    const serializedConfig = {
      ...config,
      // fieldMappings 是数组，需要序列化为字符串
      fieldMappings: config.fieldMappings
        ? JSON.stringify(config.fieldMappings)
        : "[]",
      triggerButtonConfig: config.triggerButtonConfig
        ? JSON.stringify(config.triggerButtonConfig)
        : "{}",
      // 布尔值转为字符串
      structuredOutput: String(config.structuredOutput || false),
    };

    await window.api.call("plugin", "stateSave", {
      viewId,
      data: serializedConfig,
    });

    console.log("配置已保存到服务端:", config);
  } catch (error) {
    console.error("保存配置失败:", error);
    throw error;
  }
};

/**
 * 从服务端读取配置
 * @returns {Promise<Object|null>} 配置对象或 null
 */
export const loadConfigFromServer = async () => {
  try {
    const viewId = mdyeConfig.viewId;

    const response = await window.api.call("plugin", "stateRead", {
      viewId,
    });

    console.log("从服务端读取配置:", response);

    // 返回的格式是 { data: {...}, metadata: {...} }
    if (response && response.data) {
      const config = response.data;

      // 反序列化字符串为复杂类型
      if (config.fieldMappings && typeof config.fieldMappings === "string") {
        try {
          config.fieldMappings = JSON.parse(config.fieldMappings);
        } catch (e) {
          console.error("解析 fieldMappings 失败:", e);
          config.fieldMappings = [];
        }
      }

      // 布尔值转换
      if (config.structuredOutput !== undefined) {
        config.structuredOutput =
          config.structuredOutput === "true" ||
          config.structuredOutput === true;
      }

      if (
        config.triggerButtonConfig &&
        typeof config.triggerButtonConfig === "string"
      ) {
        try {
          config.triggerButtonConfig = JSON.parse(config.triggerButtonConfig);
        } catch (e) {
          console.error("解析 triggerButtonConfig 失败:", e);
          config.triggerButtonConfig = {};
        }
      }

      return config;
    }

    return null;
  } catch (error) {
    console.error("读取配置失败:", error);
    return null;
  }
};

/**
 * 检查 API 是否可用
 * @returns {boolean}
 */
export const isApiAvailable = () => {
  return (
    typeof window.api !== "undefined" && typeof window.api.call === "function"
  );
};
