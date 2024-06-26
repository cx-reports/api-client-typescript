export abstract class ApiClientBase {
  protected abstract resolveEndpointURL(path: string, query?: any): string;

  protected abstract resolveFetchOptions(
    options: Partial<RequestInit>
  ): RequestInit;

  protected async doFetch(
    endpointPath: string,
    options: Partial<RequestInit>,
    query?: any
  ): Promise<Response> {
    let url = this.resolveEndpointURL(endpointPath, query);
    let fetchOptions = this.resolveFetchOptions(options);
    let response = await fetch(url, fetchOptions);
    if (!response.ok) await this.processError(response);
    return response;
  }

  protected async get<T>(path: string, query?: any): Promise<T> {
    let response = await this.doFetch(path, { method: "GET" }, query);
    return await response.json();
  }

  protected async post<T>(
    path: string,
    options?: { query?: any; data?: any }
  ): Promise<T> {
    let response = await this.doFetch(
      path,
      {
        method: "POST",
        body: options?.data ? JSON.stringify(options.data) : null,
        headers: { "Content-Type": "application/json" },
      },
      options?.query
    );
    return await response.json();
  }

  protected abstract processError(response: Response): Promise<never>;
}
