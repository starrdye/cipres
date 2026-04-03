import { AIService } from '../../lib/ai';
import { AISettings } from '../../types/factsheet';
import { robustJsonParse } from './jsonUtils';

export type ActionType = 'MODIFY_DATA' | 'MODIFY_LOGIC' | 'MODIFY_RATIONALE';

export interface AIActionResponse {
  action: ActionType;
  params?: any;
  newLogic?: string;
  newText?: string;
  calculationProcess?: string;
  relatedFields?: string[];
}

const ACTION_ROUTER_PROMPT = `
You are an intelligent Action Router for a financial factsheet generator.
The user is providing an instruction to modify a generated value on the factsheet.

Context:
- Target Field ID: {{FIELD_ID}}
- Current Value: {{CURRENT_VALUE}}
- Current Source: {{SOURCE}}
- Current Logic/Detail: {{DETAIL}}

User Instruction: "{{INSTRUCTION}}"

Analyze the user's instruction and route it to ONE of the structural actions below.
Return strictly a valid JSON object matching the appropriate structure.

1. MODIFY_DATA: Use this if the user wants to statically overwrite a hardcoded data point, particularly historical performance returns or static labels.
JSON Structure: { "action": "MODIFY_DATA", "params": { "year": 2024, "month": "Nov", "newValue": "2.1%" } } // or arbitrary keys/values for the target field

2. MODIFY_LOGIC: Use this if the user wants to alter an underlying mathematical formula, mapping rule, or structural condition that generates the value.
JSON Structure: 
{ 
  "action": "MODIFY_LOGIC", 
  "newLogic": "Short title of the rule",
  "calculationProcess": "Detailed step-by-step description of how the calculation should be performed.",
  "relatedFields": ["list", "of", "fieldIds", "involved"]
}

3. MODIFY_RATIONALE: Use this if the user wants to rewrite text-based commentary, explanations, or rationale blocks.
JSON Structure: { "action": "MODIFY_RATIONALE", "newText": "The rewritten paragraph." }

Rules:
- Output strictly JSON only.
- No markdown code blocks surrounding the JSON.
- Never output more than one action.
`;

export async function routeAction(
  instruction: string,
  fieldId: string,
  currentValue: string,
  source: string,
  detail: string,
  settings: AISettings
): Promise<AIActionResponse> {
  if (!instruction.trim()) throw new Error("Instruction is empty");

  const prompt = ACTION_ROUTER_PROMPT
    .replace('{{FIELD_ID}}', fieldId)
    .replace('{{CURRENT_VALUE}}', currentValue)
    .replace('{{SOURCE}}', source)
    .replace('{{DETAIL}}', detail)
    .replace('{{INSTRUCTION}}', instruction);

  const response = await AIService.call(prompt, settings);
  const json = robustJsonParse<AIActionResponse>(response);
  
  if (!json) {
    throw new Error('Failed to parse AI action routing response.');
  }
  
  return json;
}
