import { writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { config } from "dotenv";
import { CxReportsClient } from "@cx-reports/api-client";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables.");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
  defaultTimezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
});

if (!process.env.DEFAULT_REPORT_ID)
  throw new Error("Missing report ID environment variable.");

try {
  let reportId: number = parseInt(process.env.DEFAULT_REPORT_ID);
  let response = await client.downloadPDF({ reportId });
  const body = Readable.fromWeb(response.body as any);
  await writeFile("document.pdf", body);
  console.log("PDF downloaded");
} catch (error) {
  console.error(error);
}
