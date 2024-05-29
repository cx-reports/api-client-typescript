import { ApiClientBase } from "../util/ApiClientBase";
import { buildUrl } from "../util/buildUrl";
import { ErrorData } from "./models/ErrorData";

export interface CxReportsClientConfig {
  baseUrl: string;
  authToken: string;
  defaultWorkspaceId?: string;
}

export class CxReportsClient extends ApiClientBase {
  config: CxReportsClientConfig;

  constructor(config: CxReportsClientConfig) {
    super();
    if (config.baseUrl.endsWith("/"))
      config.baseUrl = config.baseUrl.slice(0, -1);
    this.config = config;
  }

  protected resolveEndpointUrl(endpointPath: string, query?: any): string {
    return buildUrl(this.config.baseUrl, "/api/v1/", endpointPath, query);
  }

  protected async processError(response: Response): Promise<never> {
    try {
      let data: ErrorData = await response.json();
      throw new Error(data.error);
    } catch (err) {
      throw new Error(response.statusText);
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

  getDefaultWorkspaceId(): string {
    if (this.config.defaultWorkspaceId == null)
      throw new Error("Missing workspaceId. Default workspaceId is not set.");
    return this.config.defaultWorkspaceId;
  }

  public getReports(params: {
    offset?: number;
    limit?: number;
    workspaceId?: string;
  }): Promise<Report[]> {
    if (params.workspaceId == null)
      params.workspaceId = this.getDefaultWorkspaceId();
    return this.get("reports", params);
  }
}
