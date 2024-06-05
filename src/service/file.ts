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

export const uploadPart = async (params: UploadPartControllerParams) => {
  const { part, partName, filename } = params;
  const formData = new FormData();
  formData.append("part", part);
  formData.append("partName", partName);
  formData.append("filename", filename);
  const res = await service.post<UploadPartControllerResponse>(
    API_UPLOAD_PART,
    {
      formData,
    },
  );
  return res.data.data;
};

export const verify = async (params: VerifyPartParams) => {
  const res = await service.post<VerifyPartResponse>(API_VERIFY, params);
  return res.data.data;
};

export const mergePart = async (params: MergePartsControllerParams) => {
  const res = await service.post<MergePartsControllerResponse>(
    API_MERGE_PART,
    params,
  );
  return res.data.data;
};
