import { escapedCode } from "./escapedCode";

export default function getCode({
  baseURL,
  apiKey,
  modelName,
  prompt,
  fieldMappings,
  structuredOutput,
  sourceImageControlId,
  resultControlId,
  triggerButtonConfig,
}) {
  return escapedCode
    .replace("{{baseURL}}", baseURL + "/chat/completions")
    .replace("{{apiKey}}", apiKey)
    .replace("{{modelName}}", modelName)
    .replace("{{prompt}}", JSON.stringify({ role: "system", content: prompt }))
    .replace("{{fieldMappings}}", JSON.stringify(fieldMappings))
    .replace("{{structuredOutput}}", structuredOutput)
    .replace("{{source_image_id}}", sourceImageControlId)
    .replace("{{result_id}}", resultControlId)
    .replace("{{triggerButtonConfig}}", JSON.stringify(triggerButtonConfig));
}
