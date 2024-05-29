# TypeScript API Client for CxReports

This library allows you to connect to the CxReports API from your applications.

```ts
import { CxReportsClient } from "@cx-reports/api-client";

const client = new CxReportsClient({
  baseUrl: "https://demo.cx-reports.com",
  authToken: "xyz",
  defaultWorkspaceId: 123,
  defaultWorkspaceCode: "test",
});

let reports = await client.getReports({ type: "invoice" });

let nonce = await client.createSingleUseWebAuthToken();

let url = client.getReportPreviewUrl({
  reportId: 123,
  reportType: "invoice",
  params: {},
  data: {},
  tmpDataId: 1
  nonce,
});

let pdf = client.getReportPdfUrl({ reportId: 123, params: {} });

let types = await client.getReportTypes();

let content = client.downloadReportPdf(123, { reportId: 123, params: {} });
```
