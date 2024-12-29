<template>
  <div class="w-38">
    <div>
      <el-button type="primary">count: {{ count }}</el-button>
    </div>
    <div class="mt-2">
      <el-button type="primary" @click="open">Open dialog form</el-button>
    </div>
  </div>

  <Dialog :visible="dialogVisible" @confirm="confirm" @cancel="cancel">
    <template #content>
      <el-form
        ref="formRef"
        :model="form"
        label-width="auto"
        style="max-width: 600px"
        v-loading="loading"
      >
        <el-form-item label="Activity name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="Activity zone" prop="region">
          <el-select
            v-model="form.region"
            placeholder="please select your zone"
          >
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

        <el-divider content-position="center">文件上传</el-divider>
        <FileUpload
          :default-file-list="defaultFileList"
          @change="getCurrentFileList"
          :disabled="disabled"
        />
      </el-form>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import api from "@/api/api";
import FileUpload from "@/components/FileUpload.vue";
import type { infoForm } from "@/types";
import { eventBus } from "@/utils/EventBus";
import type { UploadUserFile } from "element-plus";
import { getCurrentInstance, reactive, ref, useTemplateRef } from "vue";
import Dialog from "./dialog.vue";

const count = ref(0);
const { proxy }: any = getCurrentInstance();
const form = reactive<infoForm>({
  name: "",
  region: "",
  delivery: false,
  type: [],
  resource: "",
  desc: "",
  fileList: [],
});

// const formRef = ref()  3.5之前的获取模板引用的用法
// useTemplateRef() => vue3.5+ 新特性
const formRef = useTemplateRef("formRef");

const dialogVisible = ref(false);
const loading = ref(false);
const defaultFileList = ref([]);
const disabled = ref(false);

const getCurrentFileList = (fileList: UploadUserFile[]) => {
  form.fileList = fileList;
};

const resetForm = () => {
  defaultFileList.value = [];
  formRef.value?.resetFields();
};

const open = () => {
  dialogVisible.value = true;
  loading.value = false;
};

const confirm = (visible: boolean) => {
  loading.value = true;
  api.submit(form).then((res) => {
    dialogVisible.value = visible;
    loading.value = false;
    resetForm();
    proxy.$msgSuccess("Submit!!!");
  });
};

const cancel = async (visible: boolean) => {
  resetForm();
  dialogVisible.value = visible;
};

eventBus.on("addCount", (value: number) => (count.value += value));
</script>
