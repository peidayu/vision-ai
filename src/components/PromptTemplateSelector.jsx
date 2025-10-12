import React, { useState } from "react";
import { X } from "lucide-react";
import { PROMPT_TEMPLATES } from "../constants/promptTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";

const PromptTemplateSelector = ({ isOpen, onClose, onSelect }) => {
  const handleTemplateClick = (template) => {
    onSelect(template.prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* 抽屉 - 完全覆盖父容器 */}
      <div
        className={`absolute inset-0 bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="text-base font-semibold">选择模板</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 模板列表 */}
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-3 pb-4">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-sm mb-2">{template.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {template.prompt}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default PromptTemplateSelector;
