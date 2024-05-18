import { type Context } from "koa";
import { UPLOAD_DIR, extractExt, getPartDir, isValidString } from "../utils";
import { HttpError, HttpStatus } from "../utils/http-error";
import {
  type UploadPartControllerParams,
  type UploadPartControllerResponse,
} from "../utils/types";
import path from "path";

export const uploadController = async (ctx: Context) => {};
