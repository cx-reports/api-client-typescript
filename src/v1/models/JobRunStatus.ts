import { JobRunEntriesStatus } from "./JobRunEntriesStatus";

export interface JobRunStatus {
  finished: boolean;
  entries: number;
  status: JobRunEntriesStatus;
}
