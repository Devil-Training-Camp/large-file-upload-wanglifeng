import path from "path";
import fse from "fs-extra";

/**
 * @description: 判断是否是有效字符串
 * @param {*} 字符串s
 * @return {*} 布尔值
 */
export const isValidString = (s) => typeof s === "string" && s.length > 0;

/**
 * @description: 定义大文件存储目录
 * @return {*}
 */
export const UPLOAD_DIR = path.resolve(__dirname, "..", "target");

/**
 * @description: 获取文件后缀名
 * @param {string} 文件名称 filename
 * @return {*}
 */
// 虽然关系不大，不过从最终使用角度看，这个函数跟直接调用 path.extname 的效果一模一样
// 业务系统中就不必做这种无意义的封装了
export const extractExt = (filename: string): string => path.extname(filename);

/**
 * @description: 创建临时文件夹用于临时存储 chunk
 * @param {string} 文件 fileHash 值
 * @return {*}
 */
export const getChunkDir = (fileHash: string) =>
  path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`);

/**
 * @description: 获取已上传切片列表
 * @param {*} fileHash
 * @return {*}
 */
export const getUploadedList = async (fileHash) => {
  return fse.existsSync(getChunkDir(fileHash))
    ? await fse.readdir(getChunkDir(fileHash))
    : [];
};

/**
 * @description: 定义单个切片大小
 * @return {*}
 */
export const CHUNK_SIZE = 5 * 1024 * 1024;
