export class CxReportsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class MissingWorkspaceIdError extends CxReportsError {
  constructor() {
    super("Missing workspaceId. Default workspaceId is not set.");
  }
}
