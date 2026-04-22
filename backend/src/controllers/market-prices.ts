import { Hono } from "hono";
import MarketPriceModel from "../models/marketPrice.model";

const app = new Hono();

app.get("/market-prices", async (c) => {
  try {
    const allowedCommodities = ["Onion", "Tomato", "Banana", "Brinjal", "Cabbage", "Potato"];

    // Case-insensitive search using regex
    const mandiData = await MarketPriceModel.aggregate([
      // Match only the desired commodities (case-insensitive)
      {
        $match: {
          Commodity: {
            $in: allowedCommodities.map((name) => new RegExp(`^${name}$`, "i")),
          },
        },
      },
      // Sort to get the latest records first based on ArrivalDate
      { $sort: { ArrivalDate: -1 } },
      // Group by Commodity to get unique ones with latest record
      {
        $group: {
          _id: "$Commodity",
          State: { $first: "$State" },
          District: { $first: "$District" },
          Market: { $first: "$Market" },
          Commodity: { $first: "$Commodity" },
          Variety: { $first: "$Variety" },
          Grade: { $first: "$Grade" },
          ArrivalDate: { $first: "$ArrivalDate" },
          MinPrice: { $first: "$Min_x0020_Price" },
          MaxPrice: { $first: "$Max_x0020_Price" },
          ModalPrice: { $first: "$Modal_x0020_Price" },
        },
      },
    ]).limit(10);

    return c.json(mandiData, 200);
  } catch (error) {
    return c.json({ message: error }, 500);
  }
});

export default app;
