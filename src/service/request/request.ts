import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";

interface InterceptorHooks {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorCatch?: (error: any) => any;

  responseInterceptor?: (config: AxiosResponse) => AxiosResponse;
  responseInterceptorCatch?: (error: any) => any;
}

interface MYRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  interceptorHooks?: InterceptorHooks;
}

interface myData<T> {
  data: T;
  returnCode: string;
  success: boolean;
}

class MYRequest {
  instance: AxiosInstance;

  constructor(options: MYRequestConfig) {
    this.instance = axios.create(options);

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
    return new Promise((resolve, reject) => {
      debugger;
      this.instance
        .request<any, myData<T>>(config)
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
