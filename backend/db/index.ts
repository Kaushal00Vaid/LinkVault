import mongoose from "mongoose";
import env from "../config/env";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.info("MongoDB Reconnected");
    });
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
