import { config } from "dotenv";
import { CxReportsClient } from "../src/v1/CxReportsClient.js";
import { DocumentFileFormat } from "../src/v1/models/DocumentFileFormat.js";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

if (!process.env.DEFAULT_REPORT_ID)
  throw new Error("Missing report ID environment variable");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let reportId: number = parseInt(process.env.DEFAULT_REPORT_ID);
  let exportResponse = await client.startAsyncExport({
    reportId,
    body: {
      format: DocumentFileFormat.pdf,
      includeAttachments: false,
    },
  });

  console.log("Export started with ID:", exportResponse.temporaryFileId);

  let status = await client.getExportStatus({
    tempFileId: exportResponse.temporaryFileId,
  });
  console.log("Export status:", status);
} catch (error) {
  console.error(error);
}
