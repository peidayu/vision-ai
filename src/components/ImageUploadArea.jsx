import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Forward, Loader2 } from "lucide-react";
import clsx from "clsx";
import useAppStore from "../store/useAppStore";
import { processImage } from "../services/aiService";
import { toast, extractJSON } from "../lib/utils";
import { apis } from "mdye";

const ImageUploadArea = () => {
  const {
    selectedFiles,
    setSelectedFiles,
    clearFiles,
    formConfig, // 使用实时配置而非保存后的配置
    output,
    clearOutput,
    appendOutput,
    setLoading,
    setSubmitting,
    isSubmitting,
  } = useAppStore();

  // 用于累积完整的输出文本
  const [fullOutput, setFullOutput] = useState("");

  const onDrop = useCallback(
    (acceptedFiles) => {
      setSelectedFiles(acceptedFiles);
    },
    [setSelectedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
  });

  const handleSubmit = async () => {
    if (!selectedFiles.length) return;

    // 清空之前的状态
    clearOutput();
    setFullOutput("");
    setLoading(true); // 输出区域 loading
    setSubmitting(true); // 按钮 loading

    let isFirstChunk = true;
    let hasReceivedData = false;
    let accumulatedText = ""; // 累积文本

    try {
      // 验证配置
      if (!formConfig.apiKey) {
        throw new Error("请先配置 API 密钥");
      }
      if (!formConfig.baseURL) {
        throw new Error("请先配置服务地址");
      }
      if (!formConfig.modelName) {
        throw new Error("请先配置模型名称");
      }

      await processImage({
        file: selectedFiles[0],
        config: formConfig,
        stream: true,
        onTextUpdate: (textPart) => {
          // 第一次收到数据时关闭输出区域的 loading
          if (isFirstChunk) {
            setLoading(false);
            isFirstChunk = false;
            hasReceivedData = true;
          }
          // console.log(textPart);
          appendOutput(textPart);
          accumulatedText += textPart; // 累积文本
        },
      });

      // 如果整个流程结束都没有收到数据，可能是接口问题
      if (!hasReceivedData) {
        throw new Error("未收到任何响应数据");
      }

      // 流式输出完成后，处理结构化输出
      if (formConfig.structuredOutput && formConfig.fieldMappings?.length > 0) {
        console.log("开始解析结构化输出...");

        // 尝试从输出中提取 JSON
        const parsedJSON = extractJSON(accumulatedText);

        if (parsedJSON) {
          console.log("解析到的 JSON:", parsedJSON);
        }
      }
    } catch (error) {
      console.error("处理失败:", error);
      setLoading(false);

      // 显示错误信息
      let errorMessage = "图片处理失败";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        // API 响应错误
        errorMessage = `服务器错误: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        // 网络错误
        errorMessage = "网络连接失败，请检查网络设置";
      }

      toast.error(errorMessage);
    } finally {
      // 整个流程完成后关闭按钮的 loading
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="header p-3">
        <h1 className="text-md font-bold">测试</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {!selectedFiles.length && (
          <div
            className={clsx(
              "w-[300px] h-[200px] m-5 text-sm border-2 border-dashed border-gray-200 bg-gray-100/20 rounded-xl flex items-center justify-center text-gray-500/60 cursor-pointer hover:border-gray-300 transition-colors",
              {
                "border-blue-400 bg-blue-50": isDragActive,
              }
            )}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-600">释放以上传图片...</p>
            ) : (
              <p>选择图片或拖拽图片到这里</p>
            )}
          </div>
        )}
        {!!selectedFiles.length &&
          selectedFiles.map((file, index) => (
            <div className="w-[300px] h-[200px] m-5 text-sm" key={index}>
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-contain"
                alt="上传的图片"
              />
            </div>
          ))}
      </div>
      <div className="footer flex justify-between p-3">
        <Button
          variant="ghost"
          className="text-gray-500"
          disabled={isSubmitting || !selectedFiles.length}
          onClick={clearFiles}
        >
          清空
        </Button>
        <Button
          variant="outline"
          className="text-gray-500"
          disabled={!selectedFiles.length || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Forward />
              提交
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadArea;
