import './assets/main.css';
import 'element-plus/dist/index.css';

import { createApp } from 'vue';
import App from './App.vue';
import { msgSuccess } from './utils';

const app = createApp(App);
// 全局message函数
app.config.globalProperties.$msgSuccess = msgSuccess;
app.mount('#app');
