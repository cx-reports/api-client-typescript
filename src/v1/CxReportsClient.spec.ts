import { CxReportsClient } from "./CxReportsClient.js";
import { MissingWorkspaceIdError } from "./CxReportsError.js";
import { DocumentFileFormat } from "./models/DocumentFileFormat.js";

describe("CxReportsClient", () => {
  let fetchMock: any = undefined;
  let fetchResult: any = null;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, "fetch").mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fetchResult),
        }),
      ) as jest.Mock,
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
      }),
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
      expect.objectContaining({ method: "GET" }),
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
      expect.anything(),
    );
  });

  test("getReportPreviewURL resolves the correct endpoint url", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });

    expect(client.getReportPreviewURL({ reportId: 1 })).toBe(
      "http://example.com/ws/test/reports/1/preview",
    );
  });

  test("getReportPdfDownloadURL resolves the correct endpoint url", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });

    expect(client.getReportPdfDownloadURL({ reportId: 1 })).toBe(
      "http://example.com/api/v1/ws/test/reports/1/pdf",
    );
  });

  test("getReportPages resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getReportPages({ reportId: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/reports/1/pages",
      expect.anything(),
    );
  });

  test("getReportPages throws if report id is not set", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    await expect(client.getReportPages({})).rejects.toThrow();
  });

  test("getWorkspaces resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let _ = await client.getWorkspaces();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/workspaces",
      expect.anything(),
    );
  });

  test("getThemes resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = [{ id: 1, code: "default", name: "Default" }];
    let _ = await client.getThemes();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/themes",
      expect.anything(),
    );
  });

  test("getReportTemplates resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = [{ id: 1, code: "standard", name: "Standard" }];
    let _ = await client.getReportTemplates();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/templates",
      expect.anything(),
    );
  });

  test("getThemes throws if workspace id is not set", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let invoke = () => client.getThemes();
    expect(invoke).toThrow(MissingWorkspaceIdError);
  });

  test("getReportTemplates throws if workspace id is not set", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let invoke = () => client.getReportTemplates();
    expect(invoke).toThrow(MissingWorkspaceIdError);
  });

  test("getReportPdfDownloadURL includes theme and template in query when provided", () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let url = client.getReportPdfDownloadURL({
      reportId: 1,
      theme: "dark",
      template: "compact",
    });
    expect(url).toContain("theme=dark");
    expect(url).toContain("template=compact");
  });

  test("createNonceAuthToken resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let _ = await client.createNonceAuthToken();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/nonce-tokens",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("pushTemporaryData sends content to correct endpoint", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { id: 123, expiryDate: "2025-12-31" };
    let content = { key: "value" };
    let _ = await client.pushTemporaryData({ content });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/temporary-data",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("pushTemporaryData includes expires date when provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { id: 123 };
    let content = { key: "value" };
    let expiryDate = new Date("2025-12-31");
    let _ = await client.pushTemporaryData({ content, expires: expiryDate });
    let calls = fetchMock.mock.calls;
    let lastCall = calls[calls.length - 1];
    expect(lastCall[1].body).toContain("2025-12-31");
  });

  test("getExportStatus resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getExportStatus({ tempFileId: 123 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/exports/123/status",
      expect.anything(),
    );
  });

  test("getExportContent resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getExportContent({ tempFileId: 123 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/exports/123/content",
      expect.anything(),
    );
  });

  test("getReportTypes resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getReportTypes({});
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/report-types",
      expect.anything(),
    );
  });

  test("getReportTypes throws if workspace id is not set", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let invoke = () => client.getReportTypes({});
    expect(invoke).toThrow(MissingWorkspaceIdError);
  });

  test("getJobs resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getJobs({});
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs",
      expect.anything(),
    );
  });

  test("getJobs throws if workspace id is not set", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let invoke = () => client.getJobs({});
    expect(invoke).toThrow(MissingWorkspaceIdError);
  });

  test("startNewJobRun resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { id: 1, status: "pending" };
    let _ = await client.startNewJobRun({ jobId: 5, body: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/5/runs",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("startNewJobRun uses jobCode if jobId is not provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { id: 1, status: "pending" };
    let _ = await client.startNewJobRun({ jobCode: "JOB_CODE", body: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/JOB_CODE/runs",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("startNewJobRun throws if neither jobId nor jobCode is provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let invoke = () => client.startNewJobRun({ body: {} });
    expect(invoke).toThrow();
  });

  test("getJobRunStatus resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getJobRunStatus({ jobId: 5, jobRunId: 10 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/5/runs/10/status",
      expect.anything(),
    );
  });

  test("getJobRunStatus uses jobCode if jobId is not provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.getJobRunStatus({ jobCode: "JOB_CODE", jobRunId: 10 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/JOB_CODE/runs/10/status",
      expect.anything(),
    );
  });

  test("getReviewDocument resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { fileId: 999 };
    let _ = await client.getReviewDocument({ jobId: 5, jobRunId: 10 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/5/runs/10/generate-review-document",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("getReviewDocument uses jobCode if jobId is not provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { fileId: 999 };
    let _ = await client.getReviewDocument({
      jobCode: "JOB_CODE",
      jobRunId: 10,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/JOB_CODE/runs/10/generate-review-document",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("deliverAllEntriesForJobRun resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.deliverAllEntriesForJobRun({ jobId: 5, jobRunId: 10 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/5/runs/10/deliver",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("deliverAllEntriesForJobRun uses jobCode if jobId is not provided", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.deliverAllEntriesForJobRun({
      jobCode: "JOB_CODE",
      jobRunId: 10,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/jobs/JOB_CODE/runs/10/deliver",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("downloadPDF resolves the correct endpoint url and uses GET method", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.downloadPDF({ reportId: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/reports\/1\/pdf/),
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("downloadPDFWithData resolves the correct endpoint url and uses POST method", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    let _ = await client.downloadPDFWithData({
      reportId: 1,
      body: { params: { test: true } },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/reports\/1\/pdf/),
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("startAsyncExport resolves the correct endpoint url", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "test",
    });
    fetchResult = { fileId: 999 };
    let _ = await client.startAsyncExport({
      reportId: 1,
      body: {
        params: { test: true },
        format: DocumentFileFormat.pdf,
        includeAttachments: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/test/reports/1/export",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("workspace id can be provided as workspaceCode", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let _ = await client.getReports({ workspaceCode: "WS_CODE" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/WS_CODE/reports",
      expect.anything(),
    );
  });

  test("workspace id from params overrides default workspace id", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
      defaultWorkspaceId: "default",
    });
    let _ = await client.getReports({ workspaceId: 999 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/999/reports",
      expect.anything(),
    );
  });

  test("workspaceId takes precedence over workspaceCode", async () => {
    let client = new CxReportsClient({
      baseUrl: "http://example.com",
      authToken: "token",
    });
    let _ = await client.getReports({
      workspaceId: 999,
      workspaceCode: "CODE",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://example.com/api/v1/ws/999/reports",
      expect.anything(),
    );
  });
});

describe("CxReportsClient - Integration Tests with Real Environment Variables", () => {
  let client: CxReportsClient;

  beforeAll(() => {
    if (!process.env.BASE_URL || !process.env.AUTH_TOKEN) {
      console.warn(
        "Skipping integration tests: Missing BASE_URL or AUTH_TOKEN in environment",
      );
    }
  });

  beforeEach(() => {
    if (process.env.BASE_URL && process.env.AUTH_TOKEN) {
      client = new CxReportsClient({
        baseUrl: process.env.BASE_URL,
        authToken: process.env.AUTH_TOKEN,
        defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
        defaultTimezone: "UTC",
      });
    }
  });

  test("should be able to create client with environment variables", () => {
    expect(client).toBeDefined();
    expect(client.config.baseUrl).toBe(process.env.BASE_URL);
    expect(client.config.authToken).toBe(process.env.AUTH_TOKEN);
    expect(client.config.defaultWorkspaceId).toBe(
      process.env.DEFAULT_WORKSPACE_ID,
    );
  });

  test("should construct correct base URL", () => {
    expect(client.config.baseUrl).toMatch(/^https?:\/\//);
    expect(client.config.baseUrl.endsWith("/")).toBe(false);
  });

  test("should have valid auth token", () => {
    expect(client.config.authToken).toBeTruthy();
    expect(client.config.authToken?.length).toBeGreaterThan(0);
  });

  test("should have default workspace ID", () => {
    expect(client.config.defaultWorkspaceId).toBeTruthy();
    expect(parseInt(client.config.defaultWorkspaceId || "0")).toBeGreaterThan(
      0,
    );
  });

  test("getWorkspaces endpoint is constructed correctly", async () => {
    const url = client["resolveEndpointURL"]("workspaces");
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain("/api/v1/workspaces");
  });

  test("getReports endpoint is constructed correctly", async () => {
    const url = client["resolveEndpointURL"](
      `ws/${client.config.defaultWorkspaceId}/reports`,
    );
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain(client.config.defaultWorkspaceId);
    expect(url).toContain("/reports");
  });

  test("getReportPreviewURL endpoint is constructed correctly", () => {
    const url = client.getReportPreviewURL({
      reportId: parseInt(process.env.DEFAULT_REPORT_ID || "0"),
    });
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain(process.env.DEFAULT_REPORT_ID);
    expect(url).toContain("/preview");
  });

  test("getReportPdfDownloadURL endpoint is constructed correctly", () => {
    const url = client.getReportPdfDownloadURL({
      reportId: parseInt(process.env.DEFAULT_REPORT_ID || "0"),
    });
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain(process.env.DEFAULT_REPORT_ID);
    expect(url).toContain("/pdf");
  });

  test("getExportStatus endpoint is constructed correctly", async () => {
    const url = client["resolveEndpointURL"](
      `ws/${client.config.defaultWorkspaceId}/exports/123/status`,
    );
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain("/exports/123/status");
  });

  test("getJobs endpoint is constructed correctly", async () => {
    const url = client["resolveEndpointURL"](
      `ws/${client.config.defaultWorkspaceId}/jobs`,
    );
    expect(url).toContain(process.env.BASE_URL);
    expect(url).toContain("/jobs");
  });
});
