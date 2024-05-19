import { UploadPartControllerResponse } from "./../utils/types";
import { type Context } from "koa";
import { isValidString, PUBLIC_DIR, TEMP_DIR } from "../utils";
import { HttpError, HttpStatus } from "../utils/http-error";
import type {
  UploadPartControllerParams,
  UploadPartControllerResponse,
} from "../utils/types";
import path from "path";
import fs from "fs-extra";

export const uploadController = async (ctx: Context) => {
  const { filename, partName } = ctx.request.body as UploadPartControllerParams;

  const partFile = ctx.request.files?.chunk;
  if (!partFile || Array.isArray(partFile)) {
    throw new Error(`无效的块文件参数`);
  }
  if (!isValidString(filename)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "filename 不能为空: ");
  }
  if (!isValidString(partName)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "partName 不能为空: ");
  }
  let chunkDir = path.resolve(TEMP_DIR, filename);
  // 存储切片的临时文件夹
  let exist = await fs.pathExists(chunkDir);
  // 切片目录不存在，则创建切片目录
  if (!exist) {
    await fs.mkdirs(chunkDir);
  }

  let chunkFilePath = path.resolve(chunkDir, partName);
  await fs.move(partFile.filepath, chunkFilePath);
  ctx.body = {
    code: 0,
    message: "received file chunk",
    data: {
      filename,
    },
  } as UploadPartControllerResponse;
};
