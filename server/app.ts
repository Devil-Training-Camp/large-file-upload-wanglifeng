import Koa, { Context } from "koa";
import logger from "koa-pino-logger";
import bodyParser from "koa-bodyparser";
import { errorCatch } from "./middlewares/errorCatch";
import { HEADERS, PORT } from "./middlewares/config";

const app = new Koa();

// 日志
app.use(logger);

// 处理body数据
app.use(bodyParser());

// 异常处理
app.use(errorCatch());

app.listen(PORT);
