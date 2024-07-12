export interface Report {
  id: number;
  name: string;
  reportTypeId: number;
  reportTypeName: string;
  reportTemplateName: string;
  previewImage?: string;
  themeName?: string;
  isDefault: boolean;
}
