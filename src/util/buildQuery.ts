export function buildQueryString(params: Record<string, any>): string {
  return Object.keys(params)
    .filter((k) => params[k] != null)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
}
