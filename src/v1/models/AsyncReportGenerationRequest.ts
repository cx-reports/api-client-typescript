import { DocumentFileFormat } from "./DocumentFileFormat";

export interface AsyncReportGenerationRequest {
  params?: Record<string, any>;
  data?: Record<string, any>;
  lang?: string;
  timezone?: string;
  format: DocumentFileFormat;
  includeAttachments: boolean;
  excludePages?: number[];
  tempDataId?: number;
}
