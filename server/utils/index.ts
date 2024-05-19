import path from "path";

// 判断是否是有效字符串
export const isValidString = (s) => typeof s === "string" && s.length > 0;

export const isPositiveInter = (s) =>
  typeof s === "number" && s >= 0 && s % 1 === 0;

export const isUndefined = (s) => typeof s === "undefined";

// 提取后缀名
export const extractExt = (filename: string): string => path.extname(filename);

export const TEMP_DIR = path.resolve(__dirname, "temp");

export const PUBLIC_DIR = path.resolve(__dirname, "public");

export const CHUNK_SIZE = 5 * 1024 * 1024;
