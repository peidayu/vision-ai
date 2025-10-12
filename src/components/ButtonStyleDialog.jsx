import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import TriggerButton from "./TriggerButton";

// 常用的 Lucide 图标列表
const ICON_OPTIONS = [
  { value: "", label: "无图标" },
  { value: "ArrowRight", label: "箭头向右" },
  { value: "ArrowLeft", label: "箭头向左" },
  { value: "ChevronRight", label: "尖括号向右" },
  { value: "ChevronLeft", label: "尖括号向左" },
  { value: "Play", label: "播放" },
  { value: "Send", label: "发送" },
  { value: "Upload", label: "上传" },
  { value: "Download", label: "下载" },
  { value: "Check", label: "勾选" },
  { value: "Camera", label: "相机" },
  { value: "Image", label: "图片" },
  { value: "Sparkles", label: "星星" },
  { value: "Zap", label: "闪电" },
  { value: "Loader", label: "加载" },
];

const ButtonStyleDialog = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState({
    text: "",
    loadingText: "",
    iconName: "",
    loadingIconName: "",
    iconPosition: "right",
    iconColor: "#ffffff",
    iconSize: 18,
    displayType: "flex",
    style: {
      backgroundColor: "#2196f3",
      color: "#ffffff",
      borderRadius: 5,
      border: "1px solid transparent",
      fontSize: "14px",
      fontWeight: "bold",
      padding: "5px",
      height: 50,
    },
    textStyle: {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#ffffff",
    },
  });

  // 当弹窗打开或 config 改变时，更新本地状态
  useEffect(() => {
    if (isOpen && config) {
      setLocalConfig({
        text: config.text || "开始",
        loadingText: config.loadingText || "处理中",
        iconName: config.iconName || "ArrowRight",
        loadingIconName: config.loadingIconName || "Loader",
        iconPosition: config.iconPosition || "right",
        iconColor: config.iconColor || "#ffffff",
        iconSize: config.iconSize || 18,
        displayType: config.displayType || "flex",
        style: {
          backgroundColor: config.style?.backgroundColor || "#2196f3",
          color: config.style?.color || "#ffffff",
          borderRadius: config.style?.borderRadius || 5,
          border: config.style?.border || "1px solid transparent",
          fontSize: config.style?.fontSize || "14px",
          fontWeight: config.style?.fontWeight || "bold",
          padding: config.style?.padding || "5px",
          height: config.style?.height || 50,
        },
        textStyle: {
          fontSize: config.textStyle?.fontSize || "14px",
          fontWeight: config.textStyle?.fontWeight || "bold",
          color: config.textStyle?.color || "#ffffff",
        },
      });
    }
  }, [isOpen, config]);

  const handleStyleChange = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [key]: value,
      },
    }));
  };

  const handleTextStyleChange = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      textStyle: {
        ...prev.textStyle,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // 处理 display 属性
    const finalStyle = {
      ...config.style,
      ...localConfig.style,
      display: localConfig.displayType,
    };

    onSave({
      ...config,
      text: localConfig.text,
      loadingText: localConfig.loadingText,
      iconName: localConfig.iconName,
      loadingIconName: localConfig.loadingIconName,
      iconPosition: localConfig.iconPosition,
      iconColor: localConfig.iconColor,
      iconSize: localConfig.iconSize,
      displayType: localConfig.displayType,
      style: finalStyle,
      textStyle: {
        ...config.textStyle,
        ...localConfig.textStyle,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[700px] max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">设置按钮样式</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 预览区 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium mb-2 block">实时预览</Label>
            <div className="bg-white p-4 rounded border">
              <div style={{ height: localConfig.style.height + "px" }}>
                <TriggerButton
                  style={{
                    ...localConfig.style,
                    cursor: "pointer",
                    display: localConfig.displayType,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  textStyle={localConfig.textStyle}
                  text={localConfig.text}
                  iconName={localConfig.iconName}
                  iconPosition={localConfig.iconPosition}
                  iconColor={localConfig.iconColor}
                  iconSize={localConfig.iconSize}
                />
              </div>
            </div>
          </div>

          {/* 基本设置 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">基本设置</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 按钮文本 */}
              <div className="space-y-2">
                <Label htmlFor="buttonText">按钮文本</Label>
                <Input
                  id="buttonText"
                  value={localConfig.text}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  placeholder="开始"
                />
              </div>

              {/* 加载中文本 */}
              <div className="space-y-2">
                <Label htmlFor="loadingText">加载中文本</Label>
                <Input
                  id="loadingText"
                  value={localConfig.loadingText}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      loadingText: e.target.value,
                    }))
                  }
                  placeholder="处理中"
                />
              </div>
            </div>
          </div>

          {/* 图标设置 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">图标设置</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 图标名称 */}
              <div className="space-y-2">
                <Label htmlFor="iconName">图标</Label>
                <select
                  id="iconName"
                  value={localConfig.iconName}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      iconName: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 加载图标 */}
              <div className="space-y-2">
                <Label htmlFor="loadingIconName">加载图标</Label>
                <select
                  id="loadingIconName"
                  value={localConfig.loadingIconName}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      loadingIconName: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 图标位置 */}
              <div className="space-y-2">
                <Label htmlFor="iconPosition">图标位置</Label>
                <select
                  id="iconPosition"
                  value={localConfig.iconPosition}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      iconPosition: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">左侧</option>
                  <option value="right">右侧</option>
                </select>
              </div>

              {/* 图标颜色 */}
              <div className="space-y-2">
                <Label htmlFor="iconColor">图标颜色</Label>
                <div className="flex gap-2">
                  <Input
                    id="iconColor"
                    type="color"
                    value={localConfig.iconColor}
                    onChange={(e) =>
                      setLocalConfig((prev) => ({
                        ...prev,
                        iconColor: e.target.value,
                      }))
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localConfig.iconColor}
                    onChange={(e) =>
                      setLocalConfig((prev) => ({
                        ...prev,
                        iconColor: e.target.value,
                      }))
                    }
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* 图标大小 */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="iconSize">图标大小 (px)</Label>
                <Input
                  id="iconSize"
                  type="number"
                  value={localConfig.iconSize}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      iconSize: parseInt(e.target.value) || 18,
                    }))
                  }
                  min="12"
                  max="48"
                />
              </div>
            </div>
          </div>

          {/* 容器样式 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">容器样式</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 背景颜色 */}
              <div className="space-y-2">
                <Label htmlFor="bgColor">背景颜色</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={localConfig.style.backgroundColor}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localConfig.style.backgroundColor}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    className="flex-1"
                    placeholder="#2196f3"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="transparentBg"
                    checked={
                      localConfig.style.backgroundColor === "transparent"
                    }
                    onChange={(e) =>
                      handleStyleChange(
                        "backgroundColor",
                        e.target.checked ? "transparent" : "#2196f3"
                      )
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label
                    htmlFor="transparentBg"
                    className="text-xs cursor-pointer"
                  >
                    透明背景
                  </Label>
                </div>
              </div>

              {/* 按钮高度 */}
              <div className="space-y-2">
                <Label htmlFor="height">按钮高度 (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={localConfig.style.height}
                  onChange={(e) =>
                    handleStyleChange("height", parseInt(e.target.value))
                  }
                  min="30"
                  max="100"
                />
              </div>

              {/* 圆角 */}
              <div className="space-y-2">
                <Label htmlFor="borderRadius">圆角 (px)</Label>
                <Input
                  id="borderRadius"
                  type="number"
                  value={localConfig.style.borderRadius}
                  onChange={(e) =>
                    handleStyleChange("borderRadius", parseInt(e.target.value))
                  }
                  min="0"
                  max="50"
                />
              </div>

              {/* 内边距 */}
              <div className="space-y-2">
                <Label htmlFor="padding">内边距</Label>
                <Input
                  id="padding"
                  value={localConfig.style.padding}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                  placeholder="5px"
                />
              </div>

              {/* Display 类型 */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="displayType">显示类型</Label>
                <select
                  id="displayType"
                  value={localConfig.displayType}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      displayType: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="flex">弹性布局 (flex)</option>
                  <option value="inline-flex">行内弹性 (inline-flex)</option>
                  <option value="block">块级元素 (block)</option>
                  <option value="inline-block">行内块 (inline-block)</option>
                </select>
                <p className="text-xs text-gray-500">
                  flex 和 inline-flex 支持图标与文本并排显示
                </p>
              </div>
            </div>

            {/* 边框 */}
            <div className="space-y-2">
              <Label htmlFor="border">边框</Label>
              <Input
                id="border"
                value={localConfig.style.border}
                onChange={(e) => handleStyleChange("border", e.target.value)}
                placeholder="1px solid transparent"
              />
              <p className="text-xs text-gray-500">
                例如：1px solid #ccc 或 2px dashed #000
              </p>
            </div>
          </div>

          {/* 文本样式 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">文本样式</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* 文字颜色 */}
              <div className="space-y-2">
                <Label htmlFor="textColor">文字颜色</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={localConfig.textStyle.color}
                    onChange={(e) =>
                      handleTextStyleChange("color", e.target.value)
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localConfig.textStyle.color}
                    onChange={(e) =>
                      handleTextStyleChange("color", e.target.value)
                    }
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* 字体大小 */}
              <div className="space-y-2">
                <Label htmlFor="textFontSize">字体大小</Label>
                <Input
                  id="textFontSize"
                  value={localConfig.textStyle.fontSize}
                  onChange={(e) =>
                    handleTextStyleChange("fontSize", e.target.value)
                  }
                  placeholder="14px"
                />
              </div>

              {/* 字体粗细 */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="textFontWeight">字体粗细</Label>
                <select
                  id="textFontWeight"
                  value={localConfig.textStyle.fontWeight}
                  onChange={(e) =>
                    handleTextStyleChange("fontWeight", e.target.value)
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">正常</option>
                  <option value="500">中等</option>
                  <option value="600">半粗</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>保存样式</Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonStyleDialog;
