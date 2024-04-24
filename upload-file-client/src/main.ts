import { createApp } from "vue";
import ElementPlus from "element-plus";
import router from "./router";
import store from "./store";

import App from "./App.vue";

const app = createApp(App);
app.use(store);
app.use(ElementPlus);
app.use(router);

app.mount("#app");
