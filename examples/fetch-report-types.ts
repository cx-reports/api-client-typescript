import { config } from "dotenv";
import { CxReportsClient } from "../src/v1/CxReportsClient.js";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let reportTypes = await client.getReportTypes({});
  console.table(reportTypes);
} catch (error) {
  console.error(error);
}
