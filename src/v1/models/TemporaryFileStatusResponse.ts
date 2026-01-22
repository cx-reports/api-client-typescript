import { TemporaryFileStatus } from "./TemporaryFileStatus";

export interface TemporaryFileStatusResponse {
  id: number;
  status: TemporaryFileStatus;
  isReady: boolean;
  errorMessage?: string;
  expiryTime: string;
  name?: string;
  contentSize?: number;
  contentType?: string;
}
