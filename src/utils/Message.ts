import { ElMessage } from "element-plus";

function msgSuccess(message: string): void {
  ElMessage({
    message,
    type: 'success',
    duration: 1000,
  })
}

export { msgSuccess }