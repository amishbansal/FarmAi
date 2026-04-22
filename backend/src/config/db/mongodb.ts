import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;
console.log("MONGO_URI: ", MONGO_URI);
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables.");
}

class MongoDB {
  private static instance: MongoDB;
  private connection: typeof mongoose | null = null;

  private constructor() {} // Private constructor to enforce singleton

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<void> {
    if (this.connection) {
      console.log("Already connected to MongoDB.");
      return;
    }

    try {
      this.connection = await mongoose.connect(MONGO_URI, {
        dbName: process.env.MONGO_DB_NAME || "defaultDb",
      });

      console.log("MongoDB connected successfully.");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connection) return;
    
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
      this.connection = null;
    } catch (error) {
      console.error("Error disconnecting MongoDB:", error);
    }
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  await MongoDB.getInstance().disconnect();
  process.exit(0);
});

export default MongoDB.getInstance();
