import { buildQueryString } from "./buildQuery";

describe("buildQueryString", () => {
  test("writes only non-null values", () => {
    let query = buildQueryString({ a: 1, b: "2", c: null });
    expect(query).toBe("a=1&b=2");
  });
  test("values are url encoded", () => {
    let query = buildQueryString({ a: " ", b: "&" });
    expect(query).toBe("a=%20&b=%26");
  });
});
