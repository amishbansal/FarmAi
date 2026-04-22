// Bun automatically loads .env files, so no need for dotenv
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import MarketPriceModel from "../models/marketPrice.model";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "defaultDb";

const DATA_PATH = path.resolve(__dirname, "../../../mongo-seed/data.json");

// Helper to parse "DD/MM/YYYY" to Date object
function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
}

async function seedDatabase() {
    try {
        console.log("🌱 Connecting to MongoDB...");
        console.log(`URI: ${MONGO_URI}`);

        await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
        console.log("✅ Connected to MongoDB.");

        console.log("📂 Reading data.json...");
        if (!fs.existsSync(DATA_PATH)) {
            throw new Error(`Data file not found at ${DATA_PATH}`);
        }

        const rawData = fs.readFileSync(DATA_PATH, "utf-8");
        const jsonData = JSON.parse(rawData);
        console.log(`📊 Found ${jsonData.length} records in data.json.`);

        console.log("🧹 Clearing existing data...");
        await MarketPriceModel.deleteMany({});
        console.log("🗑️ Existing data cleared.");

        console.log("🔄 Mapping and inserting data...");

        // Map data to match schema
        const mappedData = jsonData.map((item: any) => ({
            State: item.state,
            District: item.district,
            Market: item.market,
            Commodity: item.commodity,
            Variety: item.variety,
            Grade: item.grade,
            ArrivalDate: parseDate(item.arrival_date),
            Min_x0020_Price: item.min_price,
            Max_x0020_Price: item.max_price,
            Modal_x0020_Price: item.modal_price,
        }));

        // Batch insert for performance
        const batchSize = 1000;
        for (let i = 0; i < mappedData.length; i += batchSize) {
            const batch = mappedData.slice(i, i + batchSize);
            await MarketPriceModel.insertMany(batch);
            console.log(`... Inserted ${Math.min(i + batchSize, mappedData.length)} / ${mappedData.length}`);
        }

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB.");
        process.exit(0);
    }
}

seedDatabase();
