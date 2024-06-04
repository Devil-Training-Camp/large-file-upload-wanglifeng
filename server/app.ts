import Koa, { Context } from "koa";
import logger from "koa-pino-logger";
import bodyParser from "koa-bodyparser";
import { errorCatch } from "./middlewares/errorCatch";
import { PORT } from "./middlewares/config";

const app = new Koa();

// 跨域
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild",
  );
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});

// 日志
app.use(logger);

// 处理body数据
app.use(bodyParser());

// 异常处理
app.use(errorCatch());

app.listen(PORT);
