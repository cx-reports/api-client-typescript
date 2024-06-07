import { ApiClientBase } from "../util/ApiClientBase.js";
import { buildUrl } from "../util/buildUrl.js";
import { CxReportsError, MissingWorkspaceIdError } from "./CxReportsError.js";
import { ErrorData } from "./models/ErrorData.js";
import { Workspace } from "./models/Workspace.js";
import { NonceToken } from "./models/NonceToken.js";
import { TemporaryData } from "./models/TemporaryData.js";

export interface CxReportsClientConfig {
  baseUrl: string;
  authToken: string;
  defaultWorkspaceId?: string;
}
interface WorkspaceIdParams {
  workspaceId?: number;
  workspaceCode?: string;
}

interface ReportIdParams {
  reportId?: number;
  reportTypeCode?: string;
}

interface ReportPreviewParams {
  params?: any;
  data?: any;
  tempDataId?: number;
  nonce?: string;
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
    query?: any
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

  public getReports(
    params?: WorkspaceIdParams & {
      query?: {
        offset?: number;
        limit?: number;
      };
    }
  ): Promise<Report[]> {
    let workspaceId = this.getWorkspaceId(params);
    return this.get(
      `ws/${encodeURIComponent(workspaceId)}/reports`,
      params?.query
    );
  }

  protected getReportId(params: ReportIdParams): string {
    let reportId = params?.reportId?.toString() ?? params?.reportTypeCode;
    if (reportId == null)
      throw new CxReportsError(
        "Invalid report identification. Missing either reportId or reportType."
      );
    return reportId;
  }

  protected encodeReportPreviewParams(params: ReportPreviewParams): any {
    return {
      params: params.params ? JSON.stringify(params.params) : null,
      data: params.data ? JSON.stringify(params.data) : null,
      nonce: params.nonce,
      tempDataId: params.tempDataId,
    };
  }

  public getReportPreviewURL(
    params: WorkspaceIdParams & ReportIdParams & ReportPreviewParams
  ): string {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    let query = this.encodeReportPreviewParams(params);
    return this.resolveEndpointURLWithApiPath(
      "/", // no api path for this endpoint
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId
      )}/preview`,
      query
    );
  }

  public getReportPdfDownloadURL(
    params: WorkspaceIdParams & ReportIdParams & ReportPreviewParams
  ): string {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    let query = this.encodeReportPreviewParams(params);

    return this.resolveEndpointURL(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId
      )}/pdf`,
      query
    );
  }

  public async downloadPDF(
    params: WorkspaceIdParams & ReportIdParams & ReportPreviewParams
  ): Promise<Response> {
    let workspaceId = this.getWorkspaceId(params);
    let reportId = this.getReportId(params);
    let query = this.encodeReportPreviewParams(params);

    return this.doFetch(
      `ws/${encodeURIComponent(workspaceId)}/reports/${encodeURIComponent(
        reportId
      )}/pdf`,
      { method: "GET" },
      query
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
    }
  ): Promise<TemporaryData> {
    let workspaceId = this.getWorkspaceId(params);

    return this.post(`ws/${encodeURIComponent(workspaceId)}/temporary-data`, {
      data: {
        content: params.content,
        expiryDate: params?.expires?.toISOString(),
      },
    });
  }
}
