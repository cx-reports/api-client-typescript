import { config } from "dotenv";
import { CxReportsClient } from "../src/v1/CxReportsClient.js";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

if (!process.env.DEFAULT_JOB_ID)
  throw new Error("Missing job ID environment variable");

if (!process.env.DEFAULT_JOB_RUN_ID)
  throw new Error("Missing job run ID environment variable");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let jobId: number = parseInt(process.env.DEFAULT_JOB_ID);
  let jobRunId: number = parseInt(process.env.DEFAULT_JOB_RUN_ID);

  let status = await client.getJobRunStatus({
    jobId,
    jobRunId,
  });

  console.log("Job run status:", status);
} catch (error) {
  console.error(error);
}
