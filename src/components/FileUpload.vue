<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      class="upload"
      action="#"
      list-type="picture-card"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :disabled="disabled"
    >
      <el-icon><Plus /></el-icon>

      <template #file="{ file, index }">
        <div>
          <img
            class="el-upload-list__item-thumbnail avatar"
            :src="file.url"
            alt=""
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePictureCardPreview(file)"
            >
              <el-icon><zoom-in /></el-icon>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleDownload(file)"
            >
              <el-icon><Download /></el-icon>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(file, index)"
            >
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500kb
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import api from '@/api/api';
import type { FileUploadProps } from '@/types';
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue';
import {
  ElMessage,
  type UploadFile,
  type UploadProgressEvent,
  type UploadProps,
  type UploadRequestHandler,
  type UploadRequestOptions,
} from 'element-plus';
import { onMounted, ref, watch } from 'vue';

// 请注意，在使用 withDefaults 时，默认值为可变引用类型 (如数组或对象) 应该封装在函数中，
// 以避免意外修改和外部副作用。这样可以确保每个组件实例都获得默认值的自己的副本。
// 在使用默认值解构时，这不是必要的。
const props = withDefaults(defineProps<FileUploadProps>(), {
  defaultFileList: () => [],
  disabled: false,
});
const emit = defineEmits<{
  (e: 'change', fileList: UploadFile[]): void;
}>();

const upLoadProgress = ref(0);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const fileList = ref<UploadFile[]>([]);

onMounted(() => {
  if (props.defaultFileList?.length) fileList.value = props.defaultFileList;
});

watch(
  () => props.defaultFileList,
  newValue => (fileList.value = newValue ?? []),
);

// 自定义上传
const handleUpload: UploadRequestHandler = (option: UploadRequestOptions) => {
  const formData = new FormData();
  // formData.append(name, value, filename);
  /**
   * filename: 传给服务器的文件名称
   */
  formData.append(option.filename, option.file, option.file.name);

  const onUploadProgress = (progressEvent: UploadProgressEvent) => {
    if (progressEvent.lengthComputable) {
      //属性 lengthComputable 主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
      // progressEvent.loaded：上传进度
      // progressEvent.total：总大小
      upLoadProgress.value =
        Math.floor(progressEvent.loaded / progressEvent.total) * 100; //实时获取上传进度
    }
  };
  return api.upload(formData, { onUploadProgress });
};

const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  console.log('handleSuccess: ', uploadFile);
  // 回传父组件最新的文件列表
  emit('change', fileList.value);
};

const beforeUpload: UploadProps['beforeUpload'] = uploadFile => {
  console.log('beforeUpload: ', uploadFile);
  if (uploadFile.type !== 'image/jpeg') {
    ElMessage.error('请选择JPG格式文件');
    return false;
  } else if (uploadFile.size / 1024 > 500) {
    ElMessage.error('图片文件大小不可超过500kb');
    return false;
  }
  return true;
};

const handleRemove = (file: UploadFile, index: number) => {
  fileList.value.splice(index, 1);
  emit('change', fileList.value);
  console.log('remove: ', file);
};

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const handleDownload = (file: UploadFile) => {
  console.log('download: ', file);
};
</script>

<style scoped>
.upload .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.upload .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.upload .el-upload:hover {
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
