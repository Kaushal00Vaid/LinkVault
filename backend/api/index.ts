import { connectDB } from "../db/index";
import app from "../app";

let isConnected = false;

const handler = async (req: any, res: any) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  app(req, res);
};

export default handler;
