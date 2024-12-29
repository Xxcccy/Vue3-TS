import type { UploadUserFile } from "element-plus";

export interface infoForm {
  name: string;
  region: string;
  delivery: boolean;
  type: string[];
  resource: string;
  desc: string;
  fileList: UploadUserFile[];
}