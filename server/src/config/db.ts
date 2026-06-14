import mongoose from "mongoose";

export const connectDatabase = async (mongoUri: string) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri);
};
