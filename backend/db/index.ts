import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
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
