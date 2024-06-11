# TypeScript API Client for CxReports

![NPM Version](https://img.shields.io/npm/v/%40cx-reports%2Fapi-client)

This library allows you to connect to the CxReports API from your applications.

## Installation

```bash
npm install @cx-reports/api-client
```

## Example Usage

```ts
import { CxReportsClient } from "@cx-reports/api-client";

const client = new CxReportsClient({
  baseUrl: "[cx-reports-server-url]",
  authToken: "[your-personal-access-token]",
  defaultWorkspaceId: "[id or code of the workspace]",
});

// export a report to PDF
let pdf = client.downloadPDF({ reportId: 123, params: {} });

// fetch all reports of type invoice
let reports = await client.getReports({ type: "invoice" });

// get all available report types
let types = await client.getReportTypes();

// get all available workspaces
let workspaces = await client.getWorkspaces();

// create a web token to authenticate iframe preview
let nonce = await client.createNonceAuthToken();

// get a preview URL of a report or report type
let url = client.getReportPreviewURL({
  reportType: "invoice",
  params: {},
  data: {},
  tmpDataId: 1
  nonce,
});

```

## Examples

The `examples` folder provides the usage examples.

To set up your environment variables:

1. Rename the `.env.sample` file to `.env`.
2. Open the `.env` file in your text editor.
3. Replace the placeholder values with your actual values.

## License

[MIT License](./LICENSE.md)
