<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      class="upload"
      action="#"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      list-type="picture-card"
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
import api from "@/api/api";
import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons-vue";
import {
  ElMessage,
  type UploadFile,
  type UploadProgressEvent,
  type UploadProps,
  type UploadRequestHandler,
  type UploadRequestOptions,
} from "element-plus";
import { onMounted, ref, watch } from "vue";

const { defaultFileList, disabled } = defineProps<{
  defaultFileList?: UploadFile[];
  disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: "change", fileList: UploadFile[]): void;
}>();

const upLoadProgress = ref(0);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const fileList = ref<UploadFile[]>([]);

onMounted(() => {
  if (defaultFileList?.length) fileList.value = defaultFileList;
});

watch(
  () => defaultFileList,
  (newValue) => (fileList.value = newValue ?? []),
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

const handleSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  console.log("handleSuccess: ", uploadFile);
  // 回传父组件最新的文件列表
  emit("change", fileList.value);
};

const beforeUpload: UploadProps["beforeUpload"] = (uploadFile) => {
  console.log("beforeUpload: ", uploadFile);
  if (uploadFile.type !== "image/jpeg") {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else if (uploadFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};

const handleRemove = (file: UploadFile, index: number) => {
  console.log("remove: ", file);
  fileList.value.splice(index, 1);
  emit("change", fileList.value);
};

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const handleDownload = (file: UploadFile) => {
  console.log(file);
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
