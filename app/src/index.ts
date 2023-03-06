import app from "./app";
import { PORT } from "./config";
import { blocksService } from "./routes/on-chain";

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  blocksService.init();
});

process.on("uncaughtException", (err) => {
  console.error("[Attention]: Unhandled Error");
  console.error(err);
  console.error("--------");
});
