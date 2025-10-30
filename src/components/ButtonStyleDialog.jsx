import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import * as LucideIconComp from "lucide-react";
import TriggerButton from "./TriggerButton";

// 全量图标名称：排除 Lucide 前缀、Icon/Circle 后缀的导出
// 说明：后续通过这些名称在 LucideIconComp 上动态取组件

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

  const allIconNames = useMemo(
    () =>
      Object.keys(LucideIconComp).filter(
        (n) =>
          !n.startsWith("Lucide") &&
          !n.endsWith("Icon") &&
          !n.endsWith("Circle")
      ),
    []
  );

  const IconPicker = ({ fieldKey, label }) => {
    const [open, setOpen] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = React.useRef(null);
    const selectedName = localConfig[fieldKey];
    const SelectedIcon = selectedName && LucideIconComp[selectedName];

    const columns = 10; // 增加列数以提升密度
    const itemHeight = 36; // 与按钮 h-9 对应，更紧凑
    const bufferRows = 3;
    const totalItems = 1 + allIconNames.length; // 包含“无”
    const totalRows = Math.ceil(totalItems / columns);

    const containerHeight = 288; // 对应 max-h-72
    const visibleRows = Math.ceil(containerHeight / itemHeight) + bufferRows;

    const currentRow = Math.floor(scrollTop / itemHeight);
    const startRow = Math.max(0, currentRow - bufferRows);
    const endRow = Math.min(totalRows, startRow + visibleRows);
    const startIndex = startRow * columns;
    const endIndex = Math.min(totalItems, endRow * columns);

    const topSpacerHeight = startRow * itemHeight;
    const bottomSpacerHeight = Math.max(0, (totalRows - endRow) * itemHeight);

    const renderCell = (index) => {
      if (index === 0) {
        const isActive = selectedName === "";
        return (
          <button
            key="__none__"
            type="button"
            title="无图标"
            onClick={() => {
              setLocalConfig((prev) => ({ ...prev, [fieldKey]: "" }));
              setOpen(false);
            }}
            className={`flex items-center justify-center h-9 rounded border text-[11px] hover:bg-gray-50 transition ${
              isActive
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-gray-200"
            }`}
          >
            无
          </button>
        );
      }
      const name = allIconNames[index - 1];
      const IconComp = LucideIconComp[name];
      if (!IconComp || !IconComp.render) return <div key={index} />;
      const isActive = selectedName === name;
      return (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => {
            setLocalConfig((prev) => ({ ...prev, [fieldKey]: name }));
            setOpen(false);
          }}
          className={`flex items-center justify-center h-9 rounded border hover:bg-gray-50 transition ${
            isActive
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <IconComp size={18} />
        </button>
      );
    };

    useEffect(() => {
      const handler = (e) => {
        if (!open) return;
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
      <div className="space-y-2 relative">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <div
            role="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-1.5 rounded cursor-pointer select-none hover:bg-gray-50 transition-colors"
          >
            {SelectedIcon ? (
              <SelectedIcon
                className="shrink-0"
                color={localConfig.iconColor}
                size={18}
              />
            ) : (
              <span className="text-[11px] text-gray-400">未选择</span>
            )}
          </div>
          {selectedName && (
            <Button
              variant="outline"
              onClick={() =>
                setLocalConfig((prev) => ({ ...prev, [fieldKey]: "" }))
              }
              className="h-8 px-2"
            >
              清除
            </Button>
          )}
        </div>

        {open && (
          <div
            ref={containerRef}
            className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg"
          >
            <div
              className="grid grid-cols-10 gap-1.5 max-h-72 overflow-y-auto p-1.5"
              style={{ position: "relative" }}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
              <div style={{ height: topSpacerHeight }} />
              {Array.from({ length: endIndex - startIndex }, (_, i) =>
                renderCell(startIndex + i)
              )}
              <div style={{ height: bottomSpacerHeight }} />
            </div>
          </div>
        )}
      </div>
    );
  };

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
      <div className="bg-white rounded-lg shadow-xl w-[1000px] max-h-[92vh] flex flex-col">
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
              <IconPicker fieldKey="iconName" label="图标" />

              <IconPicker fieldKey="loadingIconName" label="加载图标" />

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
