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
      <Form :loading="loading"></Form>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue';
import Dialog from './dialog.vue';
import Form from './form.vue';
import { eventBus } from '@/utils/EventBus';

const count = ref(0);
const { proxy }: any = getCurrentInstance();

const dialogVisible = ref(false);
const loading = ref(false);

const open = () => dialogVisible.value = true;

const confirm = (visible: boolean) => {
  loading.value = true;
  setTimeout(() => {
    dialogVisible.value = visible;
    loading.value = false;
    proxy.$msgSuccess('Confirm!!!');
  }, 500);
}

const cancel = (visible: boolean) => dialogVisible.value = visible;

eventBus.on('addCount', (value: number) => count.value += value);
</script>