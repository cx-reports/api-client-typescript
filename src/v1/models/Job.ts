export interface Job {
  id: number;
  name?: string;
  description?: string;
  code?: string;
  reviewRequired: boolean;
  isActive: boolean;
  lastRunTime?: string;
}
