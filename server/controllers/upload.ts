import { type Context } from "koa";
import { extractExt, getChunkDir, isValidString, UPLOAD_DIR } from "../utils";
import { HttpError, HttpStatus } from "../utils/http-error";
import type {
  UploadPartControllerParams,
  UploadPartControllerResponse,
} from "../utils/types";
import path from "path";
import fs from "fs-extra";

export const uploadController = async (ctx: Context) => {
  const { fileName, fileHash, hash, size } = ctx.request.body as UploadPartControllerParams;
  console.log(ctx.request.files)
  const partFile = ctx.request.files?.chunk;
  if (!partFile || Array.isArray(partFile)) {
    throw new Error(`无效的块文件参数`);
  }
  if (!isValidString(fileName)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileName 不能为空: ");
  }
  if (!isValidString(fileHash)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileHash 不能为空: ");
  }

  const params = {
    fileName,
    fileHash,
    hash,
    size
  } as UploadPartControllerParams

  // 获取文件路径 path.resolve 将相对路径解析为绝对路径
  const filePath = path.resolve(UPLOAD_DIR, `${params.fileHash!}${extractExt(params.fileName!)}`);
  // 获取切片文件夹
  const chunkDir = getChunkDir(params.fileHash!);
  // 获取切片保存路径
  const chunkPath = path.resolve(chunkDir, params.hash!);

  // 文件存在，直接返回
  if (await fs.pathExists(filePath)) {
    ctx.body = {
      code: 0,
      message: 'file exist',
      data: {
        fileHash: fileHash
      }
    } as UploadPartControllerResponse;
  }
  // 切片存在，直接返回
  if (await fs.pathExists(chunkPath)) {
    ctx.body = {
      code: 1,
      message: 'chunk exist',
      data: {
        fileHash: fileHash
      }
    } as UploadPartControllerResponse;
  }
  // 切片目录不存在，创建切片目录
  if (!(await fs.pathExists(chunkDir))) {
    await fs.mkdirs(chunkDir, { recursive: true });
  }

  await fs.move(partFile.filepath, path.resolve(chunkDir, hash));
  ctx.body = {
    code: 2,
    message: 'received file chunk',
    data: {
      fileHash: fileHash
    }
  } as UploadPartControllerResponse;
};
