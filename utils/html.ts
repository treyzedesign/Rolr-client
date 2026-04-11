/**
 * Safely render HTML content in React components
 */
export function createMarkup(html: string) {
  return { __html: html };
}

/**
 * Strip HTML tags from a string, returning plain text
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Truncate HTML content to a specified length of plain text
 */
export function truncateHtml(html: string, maxLength: number): string {
  const plainText = stripHtml(html);
  if (plainText.length <= maxLength) {
    return html;
  }
  return plainText.substring(0, maxLength) + "...";
}
