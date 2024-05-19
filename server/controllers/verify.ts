import type { VerifyPartResponse, VerifyPartParams } from "./../utils/types";
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
  let existFile = await fs.existsSync(filePath);
  if (existFile) {
    ctx.body = {
      code: 0,
      data: {
        needUpload: false,
      },
    } as VerifyPartResponse;
  }
  let tempDir = path.resolve(TEMP_DIR, filename);
  let exist = await fs.existsSync(tempDir);
  let uploadList: any[] = [];
  if (exist) {
    uploadList = await fs.readdir(tempDir);
    uploadList = await Promise.all(
      uploadList.map(async (filename: string) => {
        let stat = await fs.stat(path.resolve(tempDir, filename));
        return {
          filename,
          size: stat.size,
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
