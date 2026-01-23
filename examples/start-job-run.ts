import { config } from "dotenv";
import { CxReportsClient } from "../src/v1/CxReportsClient.js";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

if (!process.env.DEFAULT_JOB_ID)
  throw new Error("Missing job ID environment variable");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let jobId: number = parseInt(process.env.DEFAULT_JOB_ID);
  let jobRun = await client.startNewJobRun({
    jobId,
    body: {},
  });

  console.log("Job run started with ID:", jobRun.jobRunId);
  console.log("Job run details:", jobRun);
} catch (error) {
  console.error(error);
}
