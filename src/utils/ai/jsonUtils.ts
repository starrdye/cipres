/**
 * Extracts and parses JSON from a string that might contain other text or markdown blocks.
 */
export function robustJsonParse<T>(input: string): T {
  try {
    // 1. Try direct parse
    return JSON.parse(input.trim());
  } catch (e) {
    // 2. Try extracting content between first '{' and last '}' or '[' and ']'
    const firstBrace = input.indexOf('{');
    const lastBrace = input.lastIndexOf('}');
    const firstBracket = input.indexOf('[');
    const lastBracket = input.lastIndexOf(']');

    let jsonStr = '';
    
    // Determine the most likely JSON boundary (object or array)
    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      jsonStr = input.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      jsonStr = input.substring(firstBracket, lastBracket + 1);
    }

    if (!jsonStr) {
      throw new Error("Could not find JSON boundaries in AI response.");
    }

    // 3. Clean common AI artifacts
    // Remove trailing commas in objects and arrays
    const cleaned = jsonStr
      .replace(/,\s*([}\]])/g, '$1')
      // Remove any weird control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();

    return JSON.parse(cleaned);
  }
}
