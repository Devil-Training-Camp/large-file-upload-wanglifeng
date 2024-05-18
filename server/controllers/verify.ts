import { VerifyPartResponse, VerifyPartParams } from "./../utils/types";
import { type Context } from "koa";
import path from "path";
import fs from "fs-extra";
import { HttpError, HttpStatus } from "../utils/http-error";
import { isValidString, PUBLIC_DIR, TEMP_DIR } from "../utils";

export const verifyController = async (ctx: Context) => {
  const { filename } = ctx.request.body as VerifyPartParams;
  if (!isValidString(filename)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "filename 不能为空");
  }
  let filePath = path.resolve(PUBLIC_DIR, filename);
  let existFile = await fs.pathExists(filePath);
  if (existFile) {
    return {
      success: true,
      needUpload: false, //因为已经上传过了，所以不再需要上传了，可以实现秒传
    };
  }
  let tempDir = path.resolve(TEMP_DIR, filename);
  let exist = await fs.pathExists(tempDir);
  let uploadList: any[] = [];
  if (exist) {
    uploadList = await fs.readdir(tempDir);
    uploadList = await Promise.all(
      uploadList.map(async (filename: string) => {
        let stat = await fs.stat(path.resolve(tempDir, filename));
        return {
          filename,
          size: stat.size, //现在的文件大写 100M  30M
        };
      }),
    );
  }
  ctx.body = {
    code: 0,
    data: {
      needUpload: true,
      uploadList, // 已经上传的文件列表
    },
  } as VerifyPartResponse;
};
