import React from "react";
import useAppStore from "../store/useAppStore";
import { Loader } from "lucide-react";

const ResultDisplay = () => {
  const { output, isLoading } = useAppStore();

  return (
    <div className="w-full flex-1 border-t border-gray-200 relative  overflow-y-auto overflow-x-hidden">
      {/* 左上角的 loading 图标 */}
      {isLoading && (
        <div className="absolute top-3 left-3 z-10">
          <Loader className="w-4 h-4 animate-spin text-gray-500" />
        </div>
      )}

      {/* 内容区域 */}
      <div className="h-full p-5">
        {output ? (
          // 显示结果
          <div className="whitespace-pre-line text-gray-600">{output}</div>
        ) : (
          // 空状态
          <div className="h-full flex items-center justify-center text-gray-400">
            {/* <p>识别结果将在这里显示...</p> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
