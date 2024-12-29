import { ElMessage } from 'element-plus';

function msgSuccess(message: string): void {
  ElMessage({
    message,
    type: 'success',
    duration: 1500,
  });
}

export { msgSuccess };
