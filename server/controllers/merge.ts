import type { VerifyPartParams, VerifyPartResponse } from "./../utils/types";
import { type Context } from "koa";
import { CHUNK_SIZE, isValidString, PUBLIC_DIR, TEMP_DIR } from "../utils";
import { HttpError, HttpStatus } from "../utils/http-error";
import path from "path";
import fs from "fs-extra";

const pipeStream = (path: string, writeStream) => {
  return new Promise((resolve, reject) => {
    // 创建可读流
    const readStream = fs.createReadStream(path);
    readStream.on("end", async () => {
      fs.unlinkSync(path);
      resolve(true);
    });
    readStream.pipe(writeStream);
  });
};

export const mergePart = async (
  filename: string,
  size: number = CHUNK_SIZE,
) => {
  const filePath = path.resolve(PUBLIC_DIR, filename);
  const chunksDir = path.resolve(TEMP_DIR, filename);
  const chunkFiles = await fs.readdir(chunksDir);
  chunkFiles.sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
  await Promise.all(
    chunkFiles.map((chunkFile, index) =>
      pipeStream(
        path.resolve(chunksDir, chunkFile),
        fs.createWriteStream(filePath, {
          start: index * size,
        }),
      ),
    ),
  );
  await fs.rmdir(chunksDir);
};

export const mergeController = async (ctx: Context) => {
  const { filename } = ctx.request.body as VerifyPartParams;
  if (!isValidString(filename)) {
    throw new HttpError(HttpStatus.PARAM_ERROR, "filename 不能为空");
  }

  let filePath = path.resolve(PUBLIC_DIR, filename);
  let existFile = await fs.existsSync(filePath);
  if (existFile) {
    ctx.body = {
      code: 0,
      message: "合并成功",
    } as VerifyPartResponse;
  }

  const chunksDir = path.resolve(TEMP_DIR, filename);
  // 切片目录不存在，则无法合并切片，报异常
  if (!fs.existsSync(chunksDir)) {
    ctx.body = {
      code: 0,
      message: "合并失败，请重新上传",
    } as VerifyPartResponse;
  }
  await mergePart(filename);
  ctx.body = {
    code: 0,
    message: "合并成功",
  } as VerifyPartResponse;
};
