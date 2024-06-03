import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import icons from "./global/el-icons";

const app = createApp(App);
app.use(icons); // 注册 element-plus图标
app.use(router); // 注册路由
app.mount("#app");
