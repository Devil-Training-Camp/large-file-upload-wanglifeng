import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";

interface InterceptorHooks {
  // 哈？这些好像可以通过 typeof 方式从 axios 接口里面取？
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  // 不要用 any
  requestInterceptorCatch?: (error: any) => any;

  responseInterceptor?: (config: AxiosResponse) => AxiosResponse;
  responseInterceptorCatch?: (error: any) => any;
}

interface MYRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  interceptorHooks?: InterceptorHooks;
}

// 命名不规范，有些地方大些开头，这里又是小写开头
interface myData<T> {
  data: T;
  returnCode: string;
  success: boolean;
}

class MYRequest {
  instance: AxiosInstance;

  constructor(options: MYRequestConfig) {
    this.instance = axios.create(options);

    // 这里的 use 好像完全没有意义？
    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (err) => {
        return err;
      },
    );

    this.instance.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        return err;
      },
    );
  }

  request<T = any>(config: MYRequestConfig): Promise<T> {
    // 这个 new Promise 也没有意义
    return new Promise((resolve, reject) => {
      debugger;
      this.instance
        .request<any, myData<T>>(config)
        // 用 async-await 语法
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  get<T = any>(config: MYRequestConfig): Promise<T> {
    return this.request({ ...config, method: "GET" });
  }

  post<T = any>(config: MYRequestConfig): Promise<T> {
    debugger;
    return this.request({ ...config, method: "POST" });
  }

  delete<T = any>(config: MYRequestConfig): Promise<T> {
    return this.request({ ...config, method: "DELETE" });
  }

  patch<T = any>(config: MYRequestConfig): Promise<T> {
    return this.request({ ...config, method: "PATCH" });
  }
}

export default MYRequest;
