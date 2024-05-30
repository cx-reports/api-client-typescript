import { buildUrl } from "./buildUrl";

describe("buildUrl", () => {
  test("builds a url with no query params", () => {
    let url = buildUrl("http://example.com", "/api/", "endpoint");
    expect(url).toBe("http://example.com/api/endpoint");
  });
  test("builds a url with query params", () => {
    let url = buildUrl("http://example.com", "/api/", "endpoint", { a: 1 });
    expect(url).toBe("http://example.com/api/endpoint?a=1");
  });
});
