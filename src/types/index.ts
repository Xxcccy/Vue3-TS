import type { UploadFile, UploadUserFile } from 'element-plus';

export interface InfoForm {
  name: string;
  region: string;
  delivery: boolean;
  type: string[];
  resource: string;
  desc: string;
  fileList: UploadUserFile[];
}

export interface DialogProps {
  visible: boolean;
  title?: string;
  width?: string;
}

export interface FileUploadProps {
  defaultFileList?: UploadFile[];
  disabled?: boolean;
}
