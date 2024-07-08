import { type Context } from "koa";
import {
  CHUNK_SIZE,
  UPLOAD_DIR,
  extractExt,
  isValidString,
  getChunkDir,
} from "../utils";
import { HttpError, HttpStatus } from "../utils/http-error";
import path from "path";
import { pipeline } from "stream/promises";
import fs from "fs-extra";
import {
  MergePartsControllerParams,
  MergePartsControllerResponse,
} from "../utils/types";

/**
 * 合并切片
 * @param {*} filePath 文件目录
 * @param {*} fileHash 文件 hash 值
 * @param {*} size 切片的个数
 */
export const mergePart = async (
  filePath: string,
  fileHash: string,
  size: number = CHUNK_SIZE,
) => {
  // 获取切片路径
  const chunkDir = getChunkDir(fileHash);
  // 读取所有 chunk 路径
  const chunkPaths = await fs.readdir(chunkDir);
  // 根据切片下标进行排序，否则直接读取目录获取的顺序可能会错乱
  chunkPaths.sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
  // 并发写入文件
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeline(
        // 指定位置创建可写流
        fs.createReadStream(path.resolve(chunkDir, chunkPath)),
        fs.createWriteStream(filePath, {
          start: index * size,
        }),
      ),
    ),
  );
  // 合并后删除保存切片的目录
  await fs.rmSync(chunkDir, { recursive: true });
};

export const mergeController = async (ctx: Context) => {
  const { fileName, fileHash, size } = ctx.request
    .body as MergePartsControllerParams;
  if (!isValidString(fileName)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileName 不能为空");
  }
  if (!isValidString(fileHash)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "fileHash 不能为空");
  }

  const ext = extractExt(fileName);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  await mergePart(filePath, fileHash, size);
  ctx.body = {
    code: 0,
    msg: "file merged success",
    data: { fileHash: fileHash },
  } as MergePartsControllerResponse;
};
