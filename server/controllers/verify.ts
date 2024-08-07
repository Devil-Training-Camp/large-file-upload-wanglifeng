import type { VerifyPartResponse, VerifyPartParams } from "./../utils/types";
import { type Context } from "koa";
import path from "path";
import fs from "fs-extra";
import { HttpError, HttpStatus } from "../utils/http-error";
import {
  getUploadedList,
  isValidString,
  UPLOAD_DIR,
} from "../utils";

/**
 * @description: 判断文件是否上传过
 * @param {Context} ctx
 * @return {*}
 */
export const verifyController = async (ctx: Context) => {
  const { fileName, fileHash } = ctx.request.body as VerifyPartParams;
  if (!isValidString(fileName)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileName 不能为空");
  }
  if (!isValidString(fileHash)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileHash 不能为空");
  }

  let needUpload = true;
  let msg = "文件不存在，需要上传";
  const ext = path.extname(fileName);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  if (fs.existsSync(filePath)) {
    needUpload = false;
    msg = "文件存在，不需要上传";
  }
  ctx.body = {
    code: 0,
    data: {
      needUpload,
      uploadedList: await getUploadedList(fileHash),
    },
    msg,
  } as VerifyPartResponse;
};
