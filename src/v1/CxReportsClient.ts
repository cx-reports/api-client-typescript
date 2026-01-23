import { ApiClientBase } from "../util/ApiClientBase.js";
import { buildUrl } from "../util/buildUrl.js";
import { CxReportsError, MissingWorkspaceIdError } from "./CxReportsError.js";
import { ErrorData } from "./models/ErrorData.js";
import { Workspace } from "./models/Workspace.js";
import { NonceToken } from "./models/NonceToken.js";
import { TemporaryData } from "./models/TemporaryData.js";
import { TemporaryFileStatusResponse } from "./models/TemporaryFileStatusResponse.js";
import { ReportType } from "./models/ReportType.js";
import { ReportPage } from "./models/ReportPage.js";
import { DocumentFileFormat } from "./models/DocumentFileFormat.js";
import { ReportExportRequest } from "./models/ReportExportRequest.js";
import { AsyncReportGenerationRequest } from "./models/AsyncReportGenerationRequest.js";
import { AsyncReportGenerationResponse } from "./models/AsyncReportGenerationResponse.js";
import { Job } from "./models/Job.js";
import { JobRunRequest } from "./models/JobRunRequest.js";
import { JobRun } from "./models/JobRun.js";
import { JobRunStatus } from "./models/JobRunStatus.js";
import { Report } from "./models/Report.js";

export interface CxReportsClientConfig {
  baseUrl: string;
  authToken: string;
  defaultWorkspaceId?: string;
  defaultTimezone?: string;
}
interface WorkspaceIdParams {
  workspaceId?: number;
  workspaceCode?: string;
}

interface ReportIdParams {
  reportId?: number;
  reportTypeCode?: string;
}

interface JobIdParams {
  jobId?: number;
  jobCode?: string;
}

interface ReportPreviewParams {
  params?: any;
  data?: any;
  tempDataId?: number;
  nonce?: string;
  timezone?: string;
}

interface ReportExportParams extends ReportPreviewParams {
  lang?: string;
  format?: DocumentFileFormat;
  includeAttachments?: boolean;
}

export class CxReportsClient extends ApiClientBase {
  config: CxReportsClientConfig;

  constructor(config: CxReportsClientConfig) {
    super();
    if (config.baseUrl.endsWith("/"))
      config.baseUrl = config.baseUrl.slice(0, -1);
    this.config = config;
  }

  protected resolveEndpointURL(endpointPath: string, query?: any): string {
    return this.resolveEndpointURLWithApiPath("/api/v1/", endpointPath, query);
  }

  protected resolveEndpointURLWithApiPath(
    apiPath: string,
    endpointPath: string,
    query?: any,
  ): string {
    return buildUrl(this.config.baseUrl, apiPath, endpointPath, query);
  }

  protected async processError(response: Response): Promise<never> {
    try {
      let data: ErrorData = await response.json();
      throw new CxReportsError(data.error);
    } catch (err) {
      throw new CxReportsError(response.statusText);
    }
  }

  protected resolveFetchOptions(options: Partial<RequestInit>): RequestInit {
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: "Bearer " + this.config.authToken,
      },
    };
  }

  protected getDefaultWorkspaceId(): string {
    if (this.config.defaultWorkspaceId == null)
      throw new MissingWorkspaceIdError();
    return this.config.defaultWorkspaceId;
  }

  protected getWorkspaceId(params?: WorkspaceIdParams): string {
    return (
      params?.workspaceId?.toString() ??
      params?.workspaceCode ??
      this.getDefaultWorkspaceId()
    );
  }

  protected getJobId(params?: JobIdParams): string {
    let jobId = params?.jobId?.toString() ?? params?.jobCode;
    if (jobId == null)
      throw new CxReportsError(
        "Invalid job identification. Missing either jobId or jobCode.",
      );
    return jobId;
  }

  public getReports(
    params?: WorkspaceIdParams & {
      query?: {
        type?: string;
        offset?: number;
        limit?: number;
      };
    },
  ): Promise<Report[]> {
    let workspaceId = this.getWorkspaceId(params);
    return this.get(
      `ws/${encodeURIComponent(workspaceId)}/reports`,
      params?.query,
    );
  }

  public async getReportPages(
    params: WorkspaceIdParams & ReportIdParams,
  ): Promise<ReportPage[]> {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    return this.get(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(reportId)}/pages`,
    );
  }

  protected getReportId(params: ReportIdParams): string {
    let reportId = params?.reportId?.toString() ?? params?.reportTypeCode;
    if (reportId == null)
      throw new CxReportsError(
        "Invalid report identification. Missing either reportId or reportType.",
      );
    return reportId;
  }

  protected encodeReportPreviewParams<T extends ReportPreviewParams>(
    params: T,
  ): Record<string, any> {
    return {
      params: params.params ? JSON.stringify(params.params) : null,
      data: params.data ? JSON.stringify(params.data) : null,
      nonce: params.nonce,
      tempDataId: params.tempDataId,
      timezone: params.timezone ?? this.config.defaultTimezone,
      lang: "lang" in params ? params.lang : null,
      format: "format" in params ? params.format : null,
      includeAttachments:
        "includeAttachments" in params ? params.includeAttachments : undefined,
    };
  }

  public getReportPreviewURL(
    params: WorkspaceIdParams & ReportIdParams & ReportPreviewParams,
  ): string {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    let query = this.encodeReportPreviewParams(params);
    return this.resolveEndpointURLWithApiPath(
      "/", // no api path for this endpoint
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId,
      )}/preview`,
      query,
    );
  }

  public getReportPdfDownloadURL(
    params: WorkspaceIdParams & ReportIdParams & ReportPreviewParams,
  ): string {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    let query = this.encodeReportPreviewParams(params);

    return this.resolveEndpointURL(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId,
      )}/pdf`,
      query,
    );
  }

  public async downloadPDF(
    params: WorkspaceIdParams & ReportIdParams & ReportExportParams,
  ): Promise<Response> {
    params = {
      ...params,
      format: params.format ?? DocumentFileFormat.pdf,
      includeAttachments: params.includeAttachments ?? false,
    };
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);

    let query = this.encodeReportPreviewParams(params);

    return this.doFetch(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId,
      )}/pdf`,
      { method: "GET" },
      query,
    );
  }

  public async downloadPDFWithData(
    params: WorkspaceIdParams & ReportIdParams & { body: ReportExportRequest },
  ): Promise<Response> {
    const workspaceId = this.getWorkspaceId(params);
    const reportId = this.getReportId(params);
    params.body = {
      ...params.body,
      format: params.body.format ?? DocumentFileFormat.pdf,
      includeAttachments: params.body.includeAttachments ?? false,
    };
    return this.doFetch(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(reportId)}/pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params.body),
      },
    );
  }

  public async startAsyncExport(
    params: WorkspaceIdParams &
      ReportIdParams & { body: AsyncReportGenerationRequest },
  ): Promise<AsyncReportGenerationResponse> {
    const workspaceId = this.getWorkspaceId(params);
    const reportId = this.getReportId(params);
    params.body = {
      ...params.body,
      format: params.body.format ?? DocumentFileFormat.pdf,
      includeAttachments: params.body.includeAttachments ?? false,
    };
    return this.post(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(reportId)}/export`,
      {
        data: params.body,
      },
    );
  }

  public getWorkspaces(): Promise<Workspace[]> {
    return this.get("workspaces");
  }

  public createNonceAuthToken(): Promise<NonceToken> {
    return this.post("nonce-tokens");
  }

  public pushTemporaryData(
    params: WorkspaceIdParams & {
      content: any;
      expires?: Date;
    },
  ): Promise<TemporaryData> {
    let workspaceId = this.getWorkspaceId(params);

    return this.post(`ws/${encodeURIComponent(workspaceId)}/temporary-data`, {
      data: {
        content: params.content,
        expiryDate: params?.expires?.toISOString(),
      },
    });
  }

  public getExportStatus(
    params: WorkspaceIdParams & { tempFileId: number },
  ): Promise<TemporaryFileStatusResponse> {
    let workspaceId = this.getWorkspaceId(params);
    return this.get(
      `ws/${encodeURIComponent(workspaceId)}/exports/${encodeURIComponent(params.tempFileId)}/status`,
    );
  }

  public getExportContent(
    params: WorkspaceIdParams & { tempFileId: number },
  ): Promise<Response> {
    let workspaceId = this.getWorkspaceId(params);

    return this.doFetch(
      `ws/${encodeURIComponent(workspaceId)}/exports/${encodeURIComponent(
        params.tempFileId,
      )}/content`,
      { method: "GET" },
    );
  }

  public getReportTypes(params: WorkspaceIdParams): Promise<ReportType[]> {
    let workspaceId = this.getWorkspaceId(params);
    return this.get(`ws/${encodeURIComponent(workspaceId)}/report-types`);
  }

  public getJobs(params: WorkspaceIdParams): Promise<Job[]> {
    let workspaceId = this.getWorkspaceId(params);
    return this.get(`ws/${encodeURIComponent(workspaceId)}/jobs`);
  }

  public startNewJobRun(
    params: WorkspaceIdParams & JobIdParams & { body: JobRunRequest },
  ): Promise<JobRun> {
    let workspaceId = this.getWorkspaceId(params);
    let jobId = this.getJobId(params);
    return this.post(
      `ws/${encodeURIComponent(workspaceId)}/jobs/${encodeURIComponent(jobId)}/runs`,
      {
        data: params.body,
      },
    );
  }

  public getJobRunStatus(
    params: WorkspaceIdParams & JobIdParams & { jobRunId: number },
  ): Promise<JobRunStatus> {
    let workspaceId = this.getWorkspaceId(params);
    let jobId = this.getJobId(params);

    return this.get(
      `ws/${encodeURIComponent(workspaceId)}/jobs/${encodeURIComponent(jobId)}/runs/${params.jobRunId}/status`,
    );
  }

  public getReviewDocument(
    params: WorkspaceIdParams & JobIdParams & { jobRunId: number },
  ): Promise<AsyncReportGenerationResponse> {
    let workspaceId = this.getWorkspaceId(params);
    let jobId = this.getJobId(params);
    return this.post(
      `ws/${encodeURIComponent(workspaceId)}/jobs/${encodeURIComponent(jobId)}/runs/${params.jobRunId}/generate-review-document`,
    );
  }

  public deliverAllEntriesForJobRun(
    params: WorkspaceIdParams & JobIdParams & { jobRunId: number },
  ): Promise<Response> {
    let workspaceId = this.getWorkspaceId(params);
    let jobId = this.getJobId(params);
    return this.doFetch(
      `ws/${encodeURIComponent(workspaceId)}/jobs/${encodeURIComponent(jobId)}/runs/${params.jobRunId}/deliver`,
      { method: "POST" },
    );
  }
}
