import { connectDB } from "./db/index";
import env from "./config/env";
import app from "./app";

const bootstrap = async (): Promise<void> => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
};

bootstrap();
