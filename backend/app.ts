import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/index";
import errorMiddleware from "./middlewares/error.middleware";

dotenv.config();

// constants
const PORT = process.env.PORT || 8000;

const bootstrap = async () => {
  await connectDB();

  const app = express();

  // middlewares
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

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
