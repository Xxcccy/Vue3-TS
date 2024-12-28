<template>
  <el-form ref="formRef" :model="form" label-width="auto" style="max-width: 600px" v-loading="loading">
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

    <FileUpload :reset="uploadReset" />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, useTemplateRef, watch } from 'vue';
import FileUpload from '@/components/FileUpload.vue';

const { loading } = defineProps<{
  loading: boolean
}>();

// const formRef = ref(null)  3.5之前的获取模板引用的用法
// useTemplateRef() => vue3.5+ 新特性
const formRef = useTemplateRef('formRef');
const uploadReset = ref(false);

watch(
  () => loading,
  (newValue) => {
    if (!newValue) {
      // resetFields()生效的前提是el-form-item的prop属性有值
      formRef.value?.resetFields();
      uploadReset.value = true;
    }
  }
)

const form = reactive({
  name: '',
  region: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})
</script>
