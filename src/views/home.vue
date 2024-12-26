<template>
  <el-button plain @click="open">Open dialog form</el-button>

  <Dialog :visible="dialogVisible" @confirm="confirm" @cancel="cancel">
    <template #content>
      <Form :loading="loading"></Form>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue';
import Dialog from './dialog.vue';
import Form from './form.vue';

const { proxy }: any = getCurrentInstance();

const dialogVisible = ref(false);
const loading = ref(false);

const open = () => dialogVisible.value = true;

const confirm = (visible: boolean) => {
  loading.value = true;
  setTimeout(() => {
    dialogVisible.value = visible;
    loading.value = false;
    proxy.$msgSuccess('Confirm!!!')
  }, 500);
}

const cancel = (visible: boolean) => dialogVisible.value = visible;
</script>