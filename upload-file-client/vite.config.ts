import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080, // 启动端口
    host: true,
  },
});