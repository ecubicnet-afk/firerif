// Safely evaluate arithmetic expression (only numbers and +-*/ and parentheses)
export function evaluateExpression(expr: string): number | null {
  const cleaned = expr.replace(/\s/g, "");
  if (!cleaned) return null;
  // Only allow digits, +, -, *, /, (, ), and decimal points
  if (!/^[\d+\-*/.()]+$/.test(cleaned)) return null;
  try {
    const result = new Function("return (" + cleaned + ")")();
    if (typeof result !== "number" || !isFinite(result)) return null;
    return Math.round(result);
  } catch {
    return null;
  }
}

// Check if a string contains arithmetic operators (is an expression, not just a number)
export function isExpressionString(str: string): boolean {
  const cleaned = str.replace(/\s/g, "");
  return /[\d][+\-*/][\d]/.test(cleaned);
}
