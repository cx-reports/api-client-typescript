import { config } from "dotenv";
import { CxReportsClient } from "../v1.js";

console.log("HELLO");

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let reports = await client.getReports();

  console.table(reports);
} catch (error) {
  console.error(error);
}

try {
  let workspaces = await client.getWorkspaces();

  console.table(workspaces);
} catch (error) {
  console.error(error);
}

try {
  let { nonce } = await client.createNonceAuthToken();
  //nonce = decodeURIComponent(nonce);
  console.log(nonce);

  let previewUrl = client.getReportPreviewURL({
    reportId: 18620,
    nonce,
    //params: { abc: "test" },
    //data: "123",
  });

  console.log(previewUrl);
} catch (error) {
  console.error(error);
}

try {
  let tmpData = await client.pushTemporaryData({ content: { xyz: "123" } });
  console.table(tmpData);
} catch (error) {
  console.error(error);
}
