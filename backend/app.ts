import express from "express";
import cors from "cors";
import { connectDB } from "./db/index";
import errorMiddleware from "./middlewares/error.middleware";
import env from "./config/env";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes";
import vaultRouter from "./modules/vault/vault.routes";
import linkRouter from "./modules/link/link.routes";
import searchRouter from "./modules/search/search.routes";

// constants
const PORT = env.port;

const bootstrap = async () => {
  await connectDB();

  const app = express();

  // middlewares
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // all routers
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/vaults", vaultRouter);
  app.use("/api/v1/vaults/:slug/links", linkRouter);
  app.use("/api/v1/search", searchRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // error middleware
  app.use(errorMiddleware);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

bootstrap();
