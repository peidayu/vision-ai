// <free_field_name>VisionAi</free_field_name>
// <file_name>VisionAi.jsx</file_name>
function VisionAi({ env, formData, value, onChange }) {
  const [outPut, setOutPut] = useState("");
  const [loading, setLoading] = useState(false); // 新增 loading 状态
  const mapConfig = {{fieldMappings}};
  const structuredOutput = {{structuredOutput}};
  const triggerButtonConfig = {{triggerButtonConfig}};
  const handleClick = async () => {
    const imageUrl = getImageUrlOfControl(
      formData["{{source_image_id}}"].value
    );
    setOutPut("");
    setLoading(true); // 设置为 loading 状态
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
    await OpenAISSEParser.fromResponse(res, (event) => {
      if (event.type === "message") {
        const delta = event.data.choices?.[0]?.delta?.content;
        if (delta) {
          setOutPut((prev) => {
            let newOutPut = prev + delta;
            onChange(newOutPut, "{{result_id}}");
            return newOutPut;
          });
        }
      } else if (event.type === "done") {
        if(structuredOutput) {
          setOutPut(text => {
            try {
              const parsedJSON =  extractJSON(text);
              return Object.keys(parsedJSON).map(key => {
                onChange(parsedJSON[key], key);
              });
            } catch (err) {
            }
            return text;
          })
        }
        console.log("\n[Stream finished]");
        setLoading(false); // 请求完成，重置 loading 状态
      } else if (event.type === "error") {
        console.error("Error:", event.error);
        setLoading(false); // 请求出错，重置 loading 状态
      }
    });
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

  // 策略 2: 提取 ``` ... ``` 通用代码块（可能是 JSON）
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      console.warn("通用代码块解析失败:", e);
    }
  }

  // 策略 3: 提取分隔符内容
  const separatorMatch = text.match(/===START_JSON===([\s\S]*?)===END_JSON===/);
  if (separatorMatch) {
    try {
      return JSON.parse(separatorMatch[1].trim());
    } catch (e) {
      console.warn("分隔符内容解析失败:", e);
    }
  }

  // 策略 4: 查找第一个 { 到最后一个 } 的内容
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    try {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("大括号提取解析失败:", e);
    }
  }

  // 策略 5: 直接尝试解析整个文本
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    console.warn("直接解析失败:", e);
  }

  return null;
}