import { API_BASE_URL, TIME_OUT } from "./request/config";
import MYRequest from "./request/request";

const myRequest = new MYRequest({
  baseURL: API_BASE_URL,
  timeout: TIME_OUT,
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
