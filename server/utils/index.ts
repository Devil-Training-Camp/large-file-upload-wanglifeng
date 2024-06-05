import path from "path";
import fse from "fs-extra";

// 判断是否是有效字符串
export const isValidString = (s) => typeof s === "string" && s.length > 0;

// 大文件存储目录
export const UPLOAD_DIR = path.resolve(__dirname, "..", "target");

// 提取文件后缀名
export const extractExt = (filename: string): string =>
  filename.slice(filename.lastIndexOf(".", filename.length));

// 返回已上传的切片列表
export const getUploadedList = async (fileHash) => {
  return fse.existsSync(path.resolve(UPLOAD_DIR, `${fileHash}-chunks`))
    ? await fse.readdir(path.resolve(UPLOAD_DIR, `${fileHash}-chunks`))
    : [];
};

export const TEMP_DIR = path.resolve(__dirname, "temp");

export const PUBLIC_DIR = path.resolve(__dirname, "public");

export const CHUNK_SIZE = 5 * 1024 * 1024;
