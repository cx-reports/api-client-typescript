import { config } from "dotenv";
import { CxReportsClient } from "../v1.js";

config();

if (!process.env.BASE_URL || !process.env.AUTH_TOKEN)
  throw new Error("Missing required environment variables");

let client = new CxReportsClient({
  baseUrl: process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  defaultWorkspaceId: process.env.DEFAULT_WORKSPACE_ID,
});

try {
  let { nonce } = await client.createNonceAuthToken();
  console.log("NONCE", nonce);

  let { id: tmpDataId } = await client.pushTemporaryData({
    content: { xyz: "123" },
  });
  console.table(tmpDataId);

  let previewUrl = client.getReportPreviewURL({
    reportId: 18620,
    nonce,
    tmpDataId,
    //params: { abc: "test" },
    //data: "123",
  });

  console.log(previewUrl);
} catch (error) {
  console.error(error);
}
