import { Hono } from "hono";
import { postRouter } from "./router/postRouter";
import { cors } from "hono/cors";
import { userRouter } from "./router/userRouter";
import { engagementRouter } from "./router/engagementRouter";
import * as Sentry from "@sentry/cloudflare";

export interface Env {
  SENTRY_DSN: string;

  GEMINI_API_KEY: string;
  DATABASE_URL: string;
  DIRECT_DATABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
  SUPABASE_URL: string;
}

const app = new Hono<{ Bindings: Env }>();
app.use('*',cors());

app.get('/', (c) => c.text('You server is running! Check backend routes .'));

app.route("/api/v1/blog", postRouter);
app.route("/api/v1/user", userRouter);
app.route("/api/v1/stats", engagementRouter);

export default Sentry.withSentry(
    (env: Env) => ({
      dsn: env.SENTRY_DSN,
      // add other Sentry options here if needed
    }),
    app
  );
