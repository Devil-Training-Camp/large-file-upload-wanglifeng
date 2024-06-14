import axios from "axios";
import {
  MergePartsControllerParams,
  MergePartsControllerResponse,
  UploadPartControllerParams,
  UploadPartControllerResponse,
  VerifyPartParams,
  VerifyPartResponse,
} from "@/types";
import {
  API_MERGE_PART,
  API_UPLOAD_PART,
  API_VERIFY,
  BASE_URL,
} from "./config";

const service = axios.create({
  baseURL: BASE_URL,
});

/**
 * @description: 向服务端发起上传切片请求
 * @param {UploadPartControllerParams} params
 * @return {*} 返回上传结果
 */
export const uploadPart = async (params: UploadPartControllerParams) => {
  const { part, hash, fileHash, fileName, size } = params;
  const formData = new FormData();
  formData.append("part", part);
  formData.append("hash", hash);
  formData.append("fileHash", fileHash);
  formData.append("fileName", fileName);
  formData.append("size", String(size));
  const res = await service.post<UploadPartControllerResponse>(
    API_UPLOAD_PART,
    {
      formData,
    },
  );
  return res.data.data;
};

/**
 * @description: 向服务端发起检验文件是否上传请求
 * @param {VerifyPartParams} params
 * @return {*}
 */
export const verify = async (params: VerifyPartParams) => {
  const res = await service.post<VerifyPartResponse>(API_VERIFY, params);
  return res.data.data;
};

/**
 * @description: 向服务端发起切片合并请求
 * @param {MergePartsControllerParams} params
 * @return {*} 返回合并结果
 */
export const mergePart = async (params: MergePartsControllerParams) => {
  const res = await service.post<MergePartsControllerResponse>(
    API_MERGE_PART,
    params,
  );
  return res.data.data;
};
