import { buildQueryString as buildQuery } from "./buildQuery";

export function buildUrl(
  baseUrl: string,
  apiPath: string,
  endpointPath: string,
  queryParams?: any
): string {
  let url = baseUrl + apiPath + endpointPath;
  if (queryParams != null) {
    let queryString = buildQuery(queryParams);
    if (queryString.length > 0) url += "?" + queryString;
  }
  return url;
}
