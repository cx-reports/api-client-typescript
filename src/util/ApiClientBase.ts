export abstract class ApiClientBase {
  protected abstract resolveEndpointUrl(path: string, query?: any): string;

  protected abstract resolveFetchOptions(
    options: Partial<RequestInit>
  ): RequestInit;

  protected async doFetch(
    endpointPath: string,
    options: Partial<RequestInit>,
    query?: any
  ): Promise<Response> {
    let url = this.resolveEndpointUrl(endpointPath, query);
    let fetchOptions = this.resolveFetchOptions(options);
    let response = await fetch(url, fetchOptions);
    if (!response.ok) await this.processError(response);
    return response;
  }

  protected async get<T>(path: string, query?: any): Promise<T> {
    let response = await this.doFetch(path, { method: "GET" }, query);
    return await response.json();
  }

  protected abstract processError(response: Response): Promise<never>;
}
