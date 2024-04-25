import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import store from './store'

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.use(store);
app.mount('#app');
