/**
 * HTML utility functions for sanitization and escaping.
 * Used across API routes to prevent XSS vulnerabilities.
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes HTML special characters to prevent XSS.
 * Use when embedding user content in HTML body.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Escapes text for use in HTML attributes.
 * Also escapes backticks to prevent template literal injection.
 */
export function escapeHtmlAttribute(text: string): string {
  return escapeHtml(text).replace(/`/g, "&#96;");
}
