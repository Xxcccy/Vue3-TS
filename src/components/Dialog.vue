<template>
  <el-dialog
    v-model="dialogVisible"
    :width="props.width"
    :before-close="cancel"
    :close-on-click-modal="false"
  >
    <template #header>{{ props.title }}</template>
    <slot name="content"></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel"> 取 消 </el-button>
        <el-button type="primary" @click="onSubmit"> 提 交 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { DialogProps } from '@/types';
import { throttle } from '@/utils';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  title: 'New Form',
  width: '500',
});

watch(
  () => props.visible,
  (newValue: boolean) => (dialogVisible.value = newValue),
);

const emit = defineEmits<{
  (e: 'cancel', visible: boolean): void;
  (e: 'confirm', visible: boolean): void;
}>();

const dialogVisible = ref(false);

const submit = () => emit('confirm', false);
const onSubmit = throttle(submit, 1500);

const cancel = () => emit('cancel', false);
</script>
