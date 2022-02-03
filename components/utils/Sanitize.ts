export function sanitize(string: string): string {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "/": "&#x2F;",
  };
  const reg = /[&<>]/gi;
  return string.replace(reg, (match) => map[match as keyof typeof map]);
}