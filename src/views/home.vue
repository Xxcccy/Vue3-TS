<template>
  <div class="w-38">
    <el-button type="primary" @click="openOrigin">Open Origin Dialog</el-button>
    <el-button type="primary" @click="openForm">Open Form Dialog</el-button>
  </div>

  <!-- Origin Dialog -->
  <Dialog
    width="500"
    :visible="originDialogVisble"
    :title="originDialogTitle"
    @confirm="confirmOrigin"
    @cancel="cancelOrigin"
  >
    <template #content>原始对话框</template>
  </Dialog>

  <!-- Form Dialog -->
  <Dialog
    width="1000"
    :visible="formDialogVisible"
    :title="formDialogTitle"
    @confirm="confirmForm"
    @cancel="cancelForm"
  >
    <template #content>
      <el-form
        ref="formRef"
        :model="form"
        label-width="auto"
        style="width: 100%"
        v-loading="formLoading"
      >
        <el-form-item label="Activity name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="Activity zone" prop="region">
          <el-select v-model="form.region" placeholder="please select your zone">
            <el-option label="Zone one" value="shanghai" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </el-form-item>

        <el-form-item label="Instant delivery" prop="delivery">
          <el-switch v-model="form.delivery" />
        </el-form-item>

        <el-form-item label="Activity type" prop="type">
          <el-checkbox-group v-model="form.type">
            <el-checkbox value="Online activities" name="type">
              Online activities
            </el-checkbox>
            <el-checkbox value="Promotion activities" name="type">
              Promotion activities
            </el-checkbox>
            <el-checkbox value="Offline activities" name="type">
              Offline activities
            </el-checkbox>
            <el-checkbox value="Simple brand exposure" name="type">
              Simple brand exposure
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Resources" prop="resource">
          <el-radio-group v-model="form.resource">
            <el-radio value="Sponsor">Sponsor</el-radio>
            <el-radio value="Venue">Venue</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Activity form" prop="desc">
          <el-input v-model="form.desc" type="textarea" />
        </el-form-item>

        <el-divider content-position="center">文件上传组件</el-divider>
        <FileUpload
          :default-file-list="defaultFileList"
          :disabled="disabled"
          @change="getCurrentFileList"
        />
      </el-form>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import api from '@/api/api';
import Dialog from '@/components/Dialog.vue';
import FileUpload from '@/components/FileUpload.vue';
import type { InfoForm } from '@/types';
import type { UploadUserFile } from 'element-plus';
import { getCurrentInstance, nextTick, reactive, ref, useTemplateRef } from 'vue';

const { proxy }: any = getCurrentInstance();
const form = reactive<InfoForm>({
  name: '',
  region: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
  fileList: [],
});

const originDialogTitle = ref('原始对话框');
const originDialogVisble = ref(false);

// const formRef = ref()  3.5之前的获取模板引用的用法
// useTemplateRef() => vue3.5+ 新特性
const formRef = useTemplateRef('formRef');
const formDialogTitle = ref('表单组件');
const formDialogVisible = ref(false);
const formLoading = ref(false);
const defaultFileList = ref([]);
const disabled = ref(false);

const getCurrentFileList = (fileList: UploadUserFile[]) => {
  form.fileList = fileList;
};

const resetForm = () => {
  defaultFileList.value = [];
  formRef.value?.resetFields();
};

const openForm = () => {
  formDialogVisible.value = true;
  formLoading.value = false;
};

const confirmForm = async (visible: boolean) => {
  formLoading.value = true;
  await api.submit(form).then(res => {
    formDialogVisible.value = visible;
    formLoading.value = false;
    proxy.$msgSuccess('Submit!!!');
  });
  resetForm();
};

const cancelForm = (visible: boolean) => {
  formDialogVisible.value = visible;
  resetForm();
};

const openOrigin = () => (originDialogVisble.value = true);
const confirmOrigin = (visible: boolean) => (originDialogVisble.value = visible);
const cancelOrigin = (visible: boolean) => (originDialogVisble.value = visible);
</script>
