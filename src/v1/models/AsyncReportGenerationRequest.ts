import { DocumentFileFormat } from "./DocumentFileFormat";

export interface AsyncReportGenerationRequest {
  params?: any;
  data?: any;
  lang?: string;
  timezone?: string;
  format: DocumentFileFormat;
  includeAttachments: boolean;
  excludePages?: number[];
  tempDataId?: number;
}
