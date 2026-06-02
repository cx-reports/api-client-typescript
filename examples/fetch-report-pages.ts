import { config } from "dotenv";
import { CxReportsClient } from "../src/v1/CxReportsClient.js";

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
  let pages = await client.getReportPages({ reportId });
  console.table(pages);
} catch (error) {
  console.error(error);
}
