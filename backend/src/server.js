import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  console.log("MongoDB bağlantısı deneniyor…");
  await connectDB();
  console.log("MongoDB hazır.");
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
