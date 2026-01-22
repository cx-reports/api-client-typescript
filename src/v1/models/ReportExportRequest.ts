import { DocumentFileFormat } from "./DocumentFileFormat";

export interface ReportExportRequest {
  params?: any;
  data?: any;
  lang?: string;
  timezone?: string;
  format?: DocumentFileFormat;
  includeAttachments?: boolean;
}
