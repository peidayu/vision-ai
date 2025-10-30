import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlugZap,
  Plus,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import TriggerButton from "@/components/TriggerButton";
import ButtonStyleDialog from "./ButtonStyleDialog";
import PromptTemplateSelector from "./PromptTemplateSelector";
import useAppStore from "../store/useAppStore";
import { controlState, toast } from "../lib/utils";
import { PROVIDER_CONFIGS } from "../constants/providers";
import { config as mdyeConfig } from "mdye";
import { includes } from "lodash";

const ConfigPanel = () => {
  const {
    config,
    formConfig,
    updateFormConfig,
    handleProviderChange,
    saveConfig,
    loadConfig,
    isConfigChanged,
    resetConfig,
    addFieldMapping,
    updateFieldMapping,
    removeFieldMapping,
  } = useAppStore();

  // 密钥显示状态
  const [showApiKey, setShowApiKey] = useState(false);

  // 密钥输入框焦点状态
  const [isApiKeyFocused, setIsApiKeyFocused] = useState(false);

  // 按钮样式弹窗状态
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);

  // Prompt 模板选择器状态
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  // 组件挂载时加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 检查配置是否变化
  const hasChanges = useMemo(() => {
    return isConfigChanged();
  }, [isConfigChanged, config, formConfig]);

  const handleSave = async () => {
    try {
      await saveConfig();
      toast.success("配置已保存");
    } catch (error) {
      console.error("保存配置失败:", error);
      toast.error("配置保存失败，请重试");
    }
  };

  const handleReset = () => {
    if (window.confirm("确定要重置所有配置为默认值吗？")) {
      resetConfig();
      toast.success("配置已重置");
    }
  };

  // 保存按钮样式
  const handleSaveButtonStyle = (newConfig) => {
    updateFormConfig({
      triggerButtonConfig: newConfig,
    });
  };

  // 选择 Prompt 模板
  const handleSelectTemplate = (promptText) => {
    updateFormConfig({ prompt: promptText });
    toast.success("模板已应用");
  };

  // 获取可用的字段列表（排除已选择的）
  const getAvailableControls = (currentIndex = -1) => {
    const selectedControlIds =
      formConfig.fieldMappings
        ?.map((m, idx) => (idx !== currentIndex ? m.controlId : null))
        .filter(Boolean) || [];

    return mdyeConfig.controls.filter(
      (control) =>
        includes(
          [
            1, 2, 3, 4, 8, 25, 7, 9, 10, 11, 19, 23, 24, 10010, 32, 33, 41, 15,
            16, 5, 17, 18,
          ],
          control.type
        ) &&
        controlState(control).editable &&
        !selectedControlIds.includes(control.controlId)
    );
  };

  // 检查是否还有可用字段
  const hasAvailableFields = useMemo(() => {
    return getAvailableControls().length > 0;
  }, [formConfig.fieldMappings]);

  return (
    <div className="config flex flex-col w-full h-full border-l border-gray-200 relative">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full py-4 p-5 pb-8">
          <FieldSet>
            <FieldLegend>配置</FieldLegend>
            <FieldDescription>
              幻视 Vision
              是一个明道云视觉识别插件，可以分析图片并将结构化信息保存到工作表字段中。
              <br />
              配置完成后，刷新页面即可在记录详情中看到触发按钮，点击按钮自动识别并填充字段。
            </FieldDescription>
            <FieldGroup className="gap-3">
              {/* 提示词 */}
              <Field className="gap-2">
                <div className="flex flex-row items-center justify-between">
                  <FieldLabel htmlFor="prompt">提示词</FieldLabel>
                  <span
                    className="flex flex-row items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => setIsTemplateOpen(true)}
                  >
                    <Plus className="mr-[2px]" size="18" />
                    选择模板
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  className="resize-none"
                  autoComplete="off"
                  value={formConfig.prompt}
                  onChange={(e) => updateFormConfig({ prompt: e.target.value })}
                />
                <FieldDescription>
                  告诉 AI 如何识别和处理图片内容
                </FieldDescription>
              </Field>

              {/* 模型服务商 */}
              <Field>
                <div className="flex flex-row items-center justify-between">
                  <FieldLabel htmlFor="provider">模型服务商</FieldLabel>
                  {/* <span className="flex flex-row items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                    <PlugZap className="mr-[2px]" size="18" />
                    测试
                  </span> */}
                </div>
                <Select
                  value={formConfig.provider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">测试服务</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="zhipu">智谱AI</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* 服务商配置 - 测试服务时隐藏 */}
              {formConfig.provider !== "test" && (
                <>
                  {/* 服务地址 - 仅自定义时显示 */}
                  {formConfig.provider === "custom" && (
                    <Field>
                      <FieldLabel htmlFor="baseUrl">服务地址</FieldLabel>
                      <Input
                        id="baseUrl"
                        autoComplete="off"
                        value={formConfig.baseURL}
                        onChange={(e) =>
                          updateFormConfig({ baseURL: e.target.value })
                        }
                        placeholder="https://api.example.com/v1"
                      />
                      <FieldDescription>
                        自定义服务商的 API 地址
                      </FieldDescription>
                    </Field>
                  )}

                  {/* API 密钥 */}
                  <Field>
                    <FieldLabel htmlFor="apiKey">密钥</FieldLabel>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        name="api-key-field"
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-form-type="other"
                        autoCorrect="off"
                        spellCheck="false"
                        type={showApiKey ? "text" : "password"}
                        value={formConfig.apiKey}
                        onChange={(e) =>
                          updateFormConfig({ apiKey: e.target.value })
                        }
                        onFocus={() => setIsApiKeyFocused(true)}
                        onBlur={() => setIsApiKeyFocused(false)}
                        placeholder="请输入API密钥"
                        className="pr-10"
                      />
                      {isApiKeyFocused && (
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          title={showApiKey ? "隐藏密钥" : "显示密钥"}
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </Field>

                  {/* 模型名称 */}
                  <Field>
                    <FieldLabel htmlFor="modelName">模型名称</FieldLabel>
                    <Input
                      id="modelName"
                      autoComplete="off"
                      value={formConfig.modelName}
                      onChange={(e) =>
                        updateFormConfig({ modelName: e.target.value })
                      }
                      placeholder="请输入模型名称"
                    />
                    {formConfig.provider !== "custom" &&
                      formConfig.provider !== "test" && (
                        <FieldDescription>
                          默认：{PROVIDER_CONFIGS[formConfig.provider]?.name}{" "}
                          推荐模型
                        </FieldDescription>
                      )}
                  </Field>
                </>
              )}
              <FieldLegend className="mt-4">表单配置</FieldLegend>
              <FieldDescription>配置插件如何与工作表字段交互</FieldDescription>
              <Field>
                <FieldLabel htmlFor="provider">图片来源字段</FieldLabel>
                <Select
                  value={formConfig.sourceImageControlId}
                  onValueChange={(value) =>
                    updateFormConfig({ sourceImageControlId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择图片来源字段" />
                  </SelectTrigger>
                  <SelectContent>
                    {mdyeConfig.controls
                      .filter((control) => control.type === 14)
                      .map((control) => (
                        <SelectItem
                          key={control.controlId}
                          value={control.controlId}
                        >
                          {control.controlName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="provider">输出结果字段</FieldLabel>
                <Select
                  value={formConfig.resultControlId}
                  onValueChange={(value) =>
                    updateFormConfig({ resultControlId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择输出结果字段" />
                  </SelectTrigger>
                  <SelectContent>
                    {mdyeConfig.controls
                      .filter(
                        (control) =>
                          includes([1, 2], control.type) &&
                          controlState(control).editable
                      )
                      .map((control) => (
                        <SelectItem
                          key={control.controlId}
                          value={control.controlId}
                        >
                          {control.controlName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
              {/* 映射到多个字段开关 */}
              <Field>
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel>结构化输出到多个字段</FieldLabel>
                    <FieldDescription className="mt-1">
                      AI 识别结果自动填充到指定的多个字段
                    </FieldDescription>
                  </div>
                  <Switch
                    id="structuredOutput"
                    checked={formConfig.structuredOutput}
                    onCheckedChange={(checked) =>
                      updateFormConfig({ structuredOutput: checked })
                    }
                  />
                </div>
              </Field>

              {/* 字段映射配置区域 */}
              {formConfig.structuredOutput && (
                <div className="space-y-3">
                  {/* 字段映射列表 */}
                  {formConfig.fieldMappings &&
                  formConfig.fieldMappings.length > 0 ? (
                    <div className="space-y-3">
                      {formConfig.fieldMappings.map((mapping, index) => (
                        <div
                          key={mapping.id}
                          className="border rounded p-3 bg-white space-y-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">
                              字段 {index + 1}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFieldMapping(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          <Select
                            value={mapping.controlId}
                            onValueChange={(value) =>
                              updateFieldMapping(index, "controlId", value)
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="选择目标字段" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* 显示可用字段（排除其他已选字段，但包含当前字段） */}
                              {getAvailableControls(index).map((control) => (
                                <SelectItem
                                  key={control.controlId}
                                  value={control.controlId}
                                >
                                  {control.controlName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Textarea
                            placeholder="字段描述（帮助 AI 理解该字段，如：发票号码、开票日期等）"
                            value={mapping.description}
                            onChange={(e) =>
                              updateFieldMapping(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      暂无字段映射配置
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-end">
                {hasAvailableFields && (
                  <Button size="sm" variant="outline" onClick={addFieldMapping}>
                    <Plus className="w-3 h-3 mr-1" />
                    添加字段
                  </Button>
                )}
              </div>
              <Field className="mt-4">
                <div className="flex flex-row items-center justify-between">
                  <FieldLabel htmlFor="provider">触发按钮预览</FieldLabel>
                  <span
                    className="flex flex-row items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => setIsStyleDialogOpen(true)}
                  >
                    <Settings className="mr-[2px]" size="18" />
                    设置按钮样式
                  </span>
                </div>
                <div>
                  <TriggerButton
                    style={formConfig.triggerButtonConfig?.style || {}}
                    textStyle={formConfig.triggerButtonConfig?.textStyle || {}}
                    text={formConfig.triggerButtonConfig?.text || "开始"}
                    iconName={formConfig.triggerButtonConfig?.iconName}
                    iconPosition={formConfig.triggerButtonConfig?.iconPosition}
                    iconColor={formConfig.triggerButtonConfig?.iconColor}
                    iconSize={formConfig.triggerButtonConfig?.iconSize || 18}
                  />
                </div>
                <FieldDescription>
                  点击"设置按钮样式"自定义外观
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </ScrollArea>
      </div>

      <div className="flex gap-2 px-5 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="重置配置"
          className="shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          disabled={!hasChanges}
          onClick={handleSave}
          className="flex-1 rounded-full"
        >
          保存配置
        </Button>
      </div>

      {/* 按钮样式配置弹窗 */}
      <ButtonStyleDialog
        isOpen={isStyleDialogOpen}
        onClose={() => setIsStyleDialogOpen(false)}
        config={formConfig.triggerButtonConfig}
        onSave={handleSaveButtonStyle}
      />

      {/* Prompt 模板选择器 */}
      <PromptTemplateSelector
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
};

export default ConfigPanel;
