<template>
  <el-dialog
    v-model="dialogVisible"
    width="500"
    :before-close="cancel"
    :close-on-click-modal="false"
  >
    <template #header>New Form</template>
    <slot name="content"></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button type="primary" @click="onSubmit"> Confirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { throttle } from "@/utils/FnUtils";
import { ref, watch } from "vue";

const { visible } = defineProps<{
  visible: boolean;
}>();

watch(
  () => visible,
  (newValue: boolean) => (dialogVisible.value = newValue),
);

const emit = defineEmits<{
  (e: "cancel", visible: boolean): void;
  (e: "confirm", visible: boolean): void;
}>();

const dialogVisible = ref(false);

const submit = () => emit("confirm", false);
const onSubmit = throttle(submit, 1500);

const cancel = () => emit("cancel", false);
</script>
