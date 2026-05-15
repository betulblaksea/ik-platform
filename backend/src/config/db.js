import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri);
  } catch (err) {
    if (err?.name === "MongooseServerSelectionError") {
      console.error(
        "\n[MongoDB] Atlas’a bağlanılamadı. Çoğunlukla IP izin listesindedir: " +
          "Atlas → Security → Network Access → Add IP Address (geliştirme için geçici olarak 0.0.0.0/0).\n"
      );
    }
    throw err;
  }
}
