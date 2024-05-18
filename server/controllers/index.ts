import { koaBody } from "koa-body";
import Koa from "koa";
import Router from "@koa/router";

import { uploadController } from "./upload";
import { mergeController } from "./merge";
import { verifyController } from "./verify";

export const defineRoutes = (app: Koa) => {
  const router = new Router();

  router.get("/", async (ctx) => {
    ctx.body = "hello koa";
  });

  router.post("/api/upload", koaBody({ multipart: true }), uploadController);
  router.post("/api/merge", koaBody(), mergeController);
  router.post("/api/verify", koaBody(), verifyController);

  app.use(router.routes()).use(router.allowedMethods());
};
