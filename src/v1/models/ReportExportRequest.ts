import { DocumentFileFormat } from "./DocumentFileFormat";

export interface ReportExportRequest {
  params?: Record<string, any>;
  data?: Record<string, any>;
  lang?: string;
  timezone?: string;
  format?: DocumentFileFormat;
  includeAttachments?: boolean;
}
