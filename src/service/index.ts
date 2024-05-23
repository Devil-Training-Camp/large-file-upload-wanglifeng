import { BASE_URL, TIME_OUT } from "./request/config";
import MYRequest from "./request/request";

const myRequest = new MYRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  // 其实这是一层无意义的封装
  // 思考一下，直接用 axios 似乎也都能满足要求，且比较清晰
  interceptorHooks: {
    requestInterceptor: (config) => {
      return config;
    },
    requestInterceptorCatch: (err) => {
      return err;
    },
    responseInterceptor: (res) => {
      return res.data;
    },
    responseInterceptorCatch: (err) => {
      return err;
    },
  },
});

export default myRequest;
