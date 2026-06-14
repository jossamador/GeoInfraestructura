import "dotenv/config";
import http from "http";
import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { initSocket } from "./config/socket";

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGO_URI ?? "";

const bootstrap = async () => {
  await connectDatabase(mongoUri);

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

void bootstrap();
