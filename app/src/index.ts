import app from "./app";
import { PORT } from "./config";
import { blocksService, validatorsService } from "./routes/on-chain";

app.listen(PORT, async () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  await blocksService.init();
  await validatorsService.init();
});

process.on("uncaughtException", (err) => {
  console.error("[Attention]: Unhandled Error");
  console.error(err);
  console.error("--------");
});
