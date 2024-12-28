<template>
  <div>
    <el-button type="primary" @click="addCount">add count</el-button>
  </div>
</template>

<script setup lang="ts">
import { eventBus } from '@/utils/EventBus';

const addCount = () => eventBus.emit('addCount', 1);
</script>