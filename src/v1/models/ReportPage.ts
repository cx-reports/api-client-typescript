import { ReportPageTypeEnum } from "./ReportPageTypeEnum";

export interface ReportPage {
  id: number;
  name?: string;
  type: ReportPageTypeEnum;
}
