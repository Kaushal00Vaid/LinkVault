import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";
import env from "./config/env";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import vaultRouter from "./modules/vault/vault.routes";
import linkRouter from "./modules/link/link.routes";
import searchRouter from "./modules/search/search.routes";
import publicRouter from "./modules/public/public.routes";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// rate limiters

// for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// api rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

// security middlewares
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));

// middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// NoSQL injection protection
app.use((req, res, next) => {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
});

// all routers
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/public", publicRouter);
app.use("/api/v1/vaults", apiLimiter, vaultRouter);
app.use("/api/v1/vaults/:slug/links", apiLimiter, linkRouter);
app.use("/api/v1/search", apiLimiter, searchRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// error middleware
app.use(errorMiddleware);

export default app;
