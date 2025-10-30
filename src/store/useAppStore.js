import { create } from "zustand";
import { PROVIDER_CONFIGS, DEFAULT_PROMPT } from "../constants/providers";
import {
  saveConfigToServer,
  loadConfigFromServer,
  isApiAvailable,
} from "../services/configApi";
import { apis, config } from "mdye";
import _, { find } from "lodash";
import getCode from "@/lib/getCode";
import { buildStructuredPrompt } from "@/lib/utils";

// 默认触发按钮配置
const defaultTriggerButtonConfig = {
  height: 100,
  style: {
    borderRadius: 5,
    height: "100%",
    border: "1px solid transparent",
    padding: "5px",
    backgroundColor: "transparent",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  textStyle: { fontSize: "18px", fontWeight: "normal", color: "#404040" },
  text: "开始",
  loadingText: "处理中",
  iconName: "ArrowRight",
  loadingIconName: "Loader",
  iconPosition: "right",
  iconColor: "#3bc464",
  iconSize: 24,
  displayType: "flex",
};

// 统一的默认配置对象
const createDefaultConfig = () => ({
  provider: "test",
  baseURL: PROVIDER_CONFIGS.test.baseURL,
  apiKey: PROVIDER_CONFIGS.test.apiKey,
  modelName: PROVIDER_CONFIGS.test.defaultModel,
  prompt: DEFAULT_PROMPT,
  structuredOutput: false,
  fieldMappings: [],
  triggerButtonConfig: defaultTriggerButtonConfig,
});

const useAppStore = create((set, get) => ({
  // 图片相关状态
  selectedFiles: [],
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  triggerButtonConfig: defaultTriggerButtonConfig,
  setTriggerButtonConfig: (config) => set({ triggerButtonConfig: config }),
  clearFiles: () => set({ selectedFiles: [] }),

  // 输出结果
  output: "",
  setOutput: (text) => set({ output: text }),
  appendOutput: (text) => set((state) => ({ output: state.output + text })),
  clearOutput: () => set({ output: "" }),

  // 加载状态
  isLoading: false, // 输出区域的 loading（等待首次响应）
  setLoading: (loading) => set({ isLoading: loading }),

  isSubmitting: false, // 提交按钮的 loading（整个流程）
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  // 错误状态
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // 实际使用的配置（用于API调用）
  config: createDefaultConfig(),
  setConfig: (config) => set({ config }),

  // 表单临时配置（用于表单编辑，点击保存后才生效）
  formConfig: createDefaultConfig(),
  setFormConfig: (formConfig) => set({ formConfig }),
  updateFormConfig: (updates) =>
    set((state) => ({
      formConfig: { ...state.formConfig, ...updates },
    })),

  // 字段映射管理
  addFieldMapping: () =>
    set((state) => ({
      formConfig: {
        ...state.formConfig,
        fieldMappings: [
          ...(state.formConfig.fieldMappings || []),
          {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            controlId: "",
            description: "",
          },
        ],
      },
    })),

  updateFieldMapping: (index, field, value) =>
    set((state) => {
      const newMappings = [...(state.formConfig.fieldMappings || [])];
      newMappings[index] = { ...newMappings[index], [field]: value };
      return {
        formConfig: {
          ...state.formConfig,
          fieldMappings: newMappings,
        },
      };
    }),

  removeFieldMapping: (index) =>
    set((state) => ({
      formConfig: {
        ...state.formConfig,
        fieldMappings: (state.formConfig.fieldMappings || []).filter(
          (_, i) => i !== index
        ),
      },
    })),

  // 处理服务商变化
  handleProviderChange: (provider) => {
    const state = get();
    if (provider === "custom") {
      // 切换到自定义服务商，清空所有配置
      set({
        formConfig: {
          ...state.formConfig,
          provider,
          baseURL: "",
          apiKey: "",
          modelName: "",
        },
      });
    } else {
      // 切换到预置服务商，使用预置配置，清空密钥
      const providerConfig = PROVIDER_CONFIGS[provider];
      set({
        formConfig: {
          ...state.formConfig,
          provider,
          baseURL: providerConfig.baseURL,
          apiKey: providerConfig.apiKey,
          modelName: providerConfig.defaultModel,
        },
      });
    }
  },

  // 保存配置
  saveConfig: async () => {
    const state = get();
    const controlsMap = {};
    config.controls.forEach((control) => {
      controlsMap[control.controlId] = control;
    });
    const systemPrompt = buildStructuredPrompt(
      state.formConfig.prompt,
      state.formConfig.fieldMappings,
      controlsMap
    );
    console.log("systemPrompt", systemPrompt);
    const widgetCode = getCode({
      baseURL: state.formConfig.baseURL,
      apiKey: state.formConfig.apiKey,
      modelName: state.formConfig.modelName,
      prompt: systemPrompt,
      structuredOutput: state.formConfig.structuredOutput,
      fieldMappings: state.formConfig.fieldMappings,
      triggerButtonConfig: state.formConfig.triggerButtonConfig,
      sourceImageControlId: state.formConfig.sourceImageControlId,
      resultControlId: state.formConfig.resultControlId,
    });
    const worksheetInfo = await apis.worksheet.getWorksheetInfo({
      worksheetId: config.worksheetId,
      getTemplate: true,
    });
    const controls = _.get(worksheetInfo, "template.controls", []);
    const customWidgetControl = find(controls, {
      alias: "custom_widget_for_vision_ai",
    });
    if (customWidgetControl) {
      await apis.worksheet.editWorksheetControls({
        worksheetId: config.worksheetId,
        controls: [
          {
            ...customWidgetControl,
            advancedSetting: {
              ...customWidgetControl.advancedSetting,
              custom_js: widgetCode,
            },
            editattrs: ["advancedSetting"],
          },
        ],
      });
    } else {
      apis.worksheet.addWorksheetControls({
        worksheetId: config.worksheetId,
        controls: [
          {
            type: 54,
            controlName: "Vision AI Button",
            alias: "custom_widget_for_vision_ai",
            size: 3,
            advancedSetting: {
              custom_js: widgetCode,
              allowfull: "1",
              customtype: "2",
              freeid: "48b38285-da62-4fc4-9f0e-f725ae4c44f3",
              height: "80",
            },
          },
        ],
      });
    }
    set({ config: state.formConfig });

    // 优先使用服务端 API，否则降级到 localStorage
    if (isApiAvailable()) {
      try {
        await saveConfigToServer(state.formConfig);
      } catch (error) {
        console.error("服务端保存失败，使用 localStorage:", error);
        localStorage.setItem(
          "visionAIConfig",
          JSON.stringify(state.formConfig)
        );
      }
    } else {
      // API 不可用时使用 localStorage
      localStorage.setItem("visionAIConfig", JSON.stringify(state.formConfig));
    }
  },

  // 加载配置
  loadConfig: async () => {
    // 优先尝试从服务端加载
    if (isApiAvailable()) {
      try {
        const serverConfig = await loadConfigFromServer();
        if (serverConfig) {
          // 确保配置包含所有必要字段，使用默认值填充缺失的字段
          const configWithDefaults = {
            ...createDefaultConfig(),
            ...serverConfig,
          };
          set({ config: configWithDefaults, formConfig: configWithDefaults });
          return;
        }
      } catch (error) {
        console.error("服务端加载失败，尝试 localStorage:", error);
      }
    }

    // 降级到 localStorage
    const savedConfig = localStorage.getItem("visionAIConfig");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // 确保配置包含所有必要字段，使用默认值填充缺失的字段
        const configWithDefaults = {
          ...createDefaultConfig(),
          ...parsedConfig,
        };
        set({ config: configWithDefaults, formConfig: configWithDefaults });
      } catch (error) {
        console.error("加载配置失败:", error);
      }
    }
  },

  // 检查配置是否被修改
  isConfigChanged: () => {
    const state = get();
    return JSON.stringify(state.config) !== JSON.stringify(state.formConfig);
  },

  // 重置配置为默认值
  resetConfig: () => {
    set({ formConfig: createDefaultConfig() });
  },
}));

export default useAppStore;
