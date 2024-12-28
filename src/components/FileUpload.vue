<template>
  <div>
    <el-upload class="avatar-uploader" action="http://localhost:3000/upload" :show-file-list="false"
      :before-upload="beforeUpload" :on-success="handleSuccess">
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { ref, watch } from 'vue';

const { reset } = defineProps<{
  reset: boolean
}>();
// 重置上传组件
watch(
  () => reset,
  (newValue) => {
    if (newValue) imageUrl.value = '';
  }
)

const imageUrl = ref('');

const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  console.log(rawFile);
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>