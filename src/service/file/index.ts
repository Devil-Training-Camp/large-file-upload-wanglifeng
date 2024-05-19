import {
  MergePartsControllerParams,
  MergePartsControllerResponse,
  UploadPartControllerParams,
  UploadPartControllerResponse,
  VerifyPartParams,
  VerifyPartResponse,
} from "@/types";
import myRequest from "..";

export function uploadPart(
  params: UploadPartControllerParams,
  onTick: (index: number, percent: number) => void,
  index: number,
  signal?: AbortSignal,
) {
  const { part, partName, filename } = params;
  const formData = new FormData();
  formData.append("part", part);
  formData.append("partName", partName);
  formData.append("filename", filename);

  return myRequest.post({
    url: "/api/upload",
    data: formData,
    headers: {
      "content-type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const percent = Math.floor((loaded / (total || 0)) * 100);
      onTick(index, percent);
    },
    signal,
  }) as Promise<UploadPartControllerResponse>;
}

export function verify(params: VerifyPartParams) {
  return myRequest.post({
    url: "/api/verify",
    data: params,
  }) as Promise<VerifyPartResponse>;
}

export function mergePart(params: MergePartsControllerParams) {
  return myRequest.post({
    url: "/api/merge",
    data: params,
  }) as Promise<MergePartsControllerResponse>;
}
