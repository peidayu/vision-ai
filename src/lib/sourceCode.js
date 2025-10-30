// <free_field_name>VisionAi</free_field_name>
// <file_name>VisionAi.jsx</file_name>
function VisionAi({ env, formData, value, onChange }) {
  const [outPut, setOutPut] = useState("");
  const [loading, setLoading] = useState(false); // 新增 loading 状态
  const mapConfig = {{fieldMappings}};
  const structuredOutput = {{structuredOutput}};
  const triggerButtonConfig = {{triggerButtonConfig}};
  const handleClick = async () => {
    try {
      const imageUrl = getImageUrlOfControl(
        formData["{{source_image_id}}"].value
      );
      setOutPut("");
      setLoading(true); // 设置为 loading 状态
      // JSONL 解析状态
      let inJsonlBlock = false;
      let jsonlBuffer = ""; // 仅在 jsonl 代码块内累计
      let pendingLine = ""; // 处理跨 chunk 的行拼接
      const res = await fetch("{{baseURL}}", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer {{apiKey}}",
        },
        body: JSON.stringify({
          model: "{{modelName}}",
          stream: true,
          messages: [
            {{prompt}},
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        try {
          const errText = await res.text();
          let msg = errText;
          try {
            const j = JSON.parse(errText);
            msg = j.error?.message || j.message || errText;
          } catch (_) {}
          throw new Error(`请求失败(${res.status}): ${msg}`);
        } catch (e) {
          throw new Error(`请求失败(${res.status})`);
        }
      }
      let hasErrored = false;
      await OpenAISSEParser.fromResponse(res, (event) => {
        if (event.type === "message") {
          if (hasErrored) return;
          // 识别服务端以 JSON 形式返回的错误并提前终止
          try {
            if (event.data && typeof event.data === "object" && event.data.error) {
              hasErrored = true;
              console.error("Error:", event.data.error);
              setLoading(false);
              return;
            }
            if (typeof event.data === "string" && event.data.trim().startsWith("{\"error\"")) {
              const ej = JSON.parse(event.data);
              hasErrored = true;
              console.error("Error:", ej.error || ej);
              setLoading(false);
              return;
            }
          } catch (_) {}
          const delta = event.data.choices?.[0]?.delta?.content;
          if (delta) {
            setOutPut((prev) => {
              let newOutPut = prev + delta;
              onChange(newOutPut, "{{result_id}}");
              // 检测与解析 jsonl 代码块
              // 进入代码块：```jsonl
              if (!inJsonlBlock) {
                const startIdx = newOutPut.lastIndexOf("```jsonl");
                if (startIdx !== -1) {
                  inJsonlBlock = true;
                  // 截取从起始标记后的新增增量部分参与解析
                  const afterStart = newOutPut.slice(startIdx + 7); // 长度不关键，此处只表示进入块后
                  // 只处理当前 delta 内的新增以减少开销
                }
              }

              if (inJsonlBlock) {
                // 将本次增量加入缓冲
                jsonlBuffer += delta;
                // 如果出现结束标记，先截断到结束标记之前
                const endIdx = jsonlBuffer.indexOf("```");
                let parseTarget = jsonlBuffer;
                if (endIdx !== -1) {
                  parseTarget = jsonlBuffer.slice(0, endIdx);
                }
                // 逐行解析（不跨对象换行的前提下）
                const parts = (pendingLine + parseTarget).split("\n");
                pendingLine = parts.pop() || ""; // 保留最后一行（可能不完整）
                for (const lineRaw of parts) {
                  const line = lineRaw.trim();
                  if (!line) continue;
                  try {
                    const obj = JSON.parse(line);
                    if (obj && typeof obj === "object" && obj.key != null) {
                      onChange(obj.value, String(obj.key));
                    }
                  } catch (e) {
                    // 单行解析失败时忽略该行，继续后续行
                  }
                }
                // 如果检测到结束标记，则退出块并清理缓冲，尝试处理最后残留的一行
                if (endIdx !== -1) {
                  inJsonlBlock = false;
                  jsonlBuffer = "";
                  if (pendingLine.trim()) {
                    try {
                      const tailObj = JSON.parse(pendingLine.trim());
                      if (tailObj && typeof tailObj === "object" && tailObj.key != null) {
                        onChange(tailObj.value, String(tailObj.key));
                      }
                    } catch (e) {}
                  }
                  pendingLine = "";
                }
              }
              return newOutPut;
            });
          }
        } else if (event.type === "done") {
          // 结构化输出在 jsonl 流期间已逐字段更新，这里无需再整块解析
          console.log("\n[Stream finished]");
          setLoading(false); // 请求完成，重置 loading 状态
         } else if (event.type === "error") {
          console.error("Error:", event.error);
          setLoading(false); // 请求出错，重置 loading 状态
        }
      });
    } catch (error) {
      console.error("Error:", error);
      setLoading(false); // 请求出错，重置 loading 状态
    }
  };

  return (
    <TriggerButton
      style={triggerButtonConfig.style}
      textStyle={triggerButtonConfig.textStyle}
      isLoading={loading}
      iconName={triggerButtonConfig.iconName}
      loadingIconName={triggerButtonConfig.loadingIconName}
      iconPosition={triggerButtonConfig.iconPosition}
      iconColor={triggerButtonConfig.iconColor}
      iconSize={triggerButtonConfig.iconSize}
      text={triggerButtonConfig.text}
      loadingText={triggerButtonConfig.loadingText}
      onClick={loading ? null : handleClick} // 如果 loading，禁用点击
    />
  );
}

function TriggerButton({
  style = {},
  textStyle = {},
  isLoading = false,
  iconName = "ArrowRight", // lucide-react icon name 比如 ChefHat, Settings
  loadingIconName = "loader", // lucide-react icon name 比如 ChefHat, Settings
  iconPosition = "right", // left, right
  iconColor = "white",
  iconSize = 18,
  text = "开始",
  loadingText = "处理中",
  onClick,
}) {
  const iconComp = <LucideIcon
    name={isLoading ? loadingIconName : iconName}
    className={"m-[2px]" + (isLoading ? " animate-spin" : "")}
    size={iconSize}
    color={isLoading ? "#aaa" : iconColor}
  />;
  return (
    <div style={style} className="flex items-center justify-center" onClick={onClick}>
      { iconName && iconPosition === "left" && iconComp }
      <span style={textStyle}>{isLoading ? loadingText : text}</span>
      { iconName && iconPosition === "right" && iconComp }
    </div>
  );
}

/**
 * OpenAISSEParser
 *
 * 用于解析 OpenAI 接口返回的 SSE 流数据
 * 通过 reader.feed() 不断输入数据，类会解析出完整的事件并触发回调
 */
class OpenAISSEParser {
  /**
   * @param {function({type: string, data?: any}): void} onEvent
   * 事件回调：type可能为 "message" | "done" | "error"
   */
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.buffer = ""; // 用于拼接不完整的块
    this.decoder = new TextDecoder("utf-8");
    this.aborted = false;
  }

  /**
   * 向解析器提供新的数据块
   * @param {Uint8Array} chunk
   */
  feed(chunk) {
    if (this.aborted) return;
    this.buffer += this.decoder.decode(chunk, { stream: true });
    this._processBuffer();
  }

  /**
   * 内部方法：处理缓冲区中的数据
   */
  _processBuffer() {
    let index;
    while ((index = this.buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + 2);
      this._parseEvent(rawEvent.trim());
    }
  }

  /**
   * 解析单个事件块
   */
  _parseEvent(rawEvent) {
    if (!rawEvent.startsWith("data:")) return;
    const dataStr = rawEvent.replace(/^data:\s*/, "");
    if (dataStr === "[DONE]") {
      this.onEvent?.({ type: "done" });
      this.abort();
      return;
    }
    try {
      const data = JSON.parse(dataStr);
      this.onEvent?.({ type: "message", data });
    } catch (err) {
      // 可能是部分 JSON 或文本流
      this.onEvent?.({ type: "message", data: dataStr });
    }
  }

  /**
   * 停止解析
   */
  abort() {
    this.aborted = true;
  }

  /**
   * 从 fetch response 直接读取
   */
  static async fromResponse(response, onEvent) {
    const parser = new OpenAISSEParser(onEvent);
    const reader = response.body.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        parser.feed(value);
      }
    } catch (err) {
      onEvent?.({ type: "error", error: err });
    } finally {
      parser.abort();
    }
  }
}

function getImageUrlOfControl(value) {
  try {
    const parsedData = JSON.parse(value);
    if (parsedData.attachments) {
      return parsedData.attachments[0].url;
    }
    return parsedData[0].viewUrl;
  } catch (err) {
    return;
  }
}

export function extractJSON(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  // 策略 1: 提取 ```json ... ``` 代码块
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      console.warn("JSON 代码块解析失败:", e);
    }
  }
  return null;
}