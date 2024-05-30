import { CxReportsClient } from "./CxReportsClient";
import { MissingWorkspaceIdError } from "./CxReportsError";

describe("CxReportsClient", () => {
  let fetchMock: any = undefined;
  let fetchResult: any = null;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, "fetch").mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fetchResult),
        })
      ) as jest.Mock
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("constructor removes trailing slash from baseUrl", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com/",
      authToken: "token",
    });
    expect(client.config.baseUrl).toBe("http://example.com");
  });

  test("requests use the auth token", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "123token456",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getReports();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer 123token456",
        }),
      })
    );
  });

  test("getReports resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getReports({ query: { limit: 10 } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/reports?limit=10",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("getReports throws if workspace id is not set through configuration or provided as an argument", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let invoke = () => client.getReports({ query: { limit: 10 } });
    expect(invoke).toThrow(MissingWorkspaceIdError);
  });

  test("getReports uses workspace id from params if provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getReports({ workspaceId: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/1/reports",
      expect.anything()
    );
  });

  test("getReportPreviewURL resolves the correct endpoint url", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });

    expect(client.getReportPreviewURL({ reportId: 1 })).toBe(
      "http://example.com/ws/test/reports/1/preview"
    );
  });

  test("getReportPdfDownloadURL resolves the correct endpoint url", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });

    expect(client.getReportPdfDownloadURL({ reportId: 1 })).toBe(
      "http://example.com/ws/test/reports/1/pdf"
    );
  });
});
