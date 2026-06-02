import { config } from "dotenv";
//import { CxReportsClient } from "@cx-reports/api-client"; // in a real project
import { CxReportsClient } from "../src/v1/CxReportsClient.js";

config();

if (
  !process.env.BASE_URL ||
  !process.env.AUTH_TOKEN ||
  !process.env.DEFAULT_REPORT_ID
)
  throw new Error("Missing required environment variables");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
  defaultTimezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
});

try {
  let reportId = parseInt(process.env.DEFAULT_REPORT_ID);
  let { nonce } = await client.createNonceAuthToken();
  console.log("NONCE", nonce);

  let { tempDataId } = await client.pushTemporaryData({
    content: { xyz: "123" },
  });
  console.table(tempDataId);

  let previewUrl = client.getReportPreviewURL({
    reportId: reportId,
    nonce,
    tempDataId,
    //params: { abc: "test" },
    //data: "123",
  });

  console.log(previewUrl);
} catch (error) {
  console.error(error);
}
