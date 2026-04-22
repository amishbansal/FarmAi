// import { Hono } from "hono";
// import { cors } from "hono/cors";

// //controllers
// import streamChatController from "./controllers/stream-chat";
// import aiChatController from "./controllers/chat";
// import testROuter from "./controllers/test";
// import mongodb from "./config/db/mongodb";
// import mandiDataRoute from "./controllers/market-prices";
// import { setupDatasetAndExamples } from "./config/evaluation/dataset/example-dataset";

// const app = new Hono();

// //db connection
// (async () => {
//   console.log("DB connection started");
//   await mongodb.connect();
// })();

// // setupDatasetAndExamples()
// //   .then(() => console.log("Dataset creation completed."))

// app.use("/*", cors());

// app.get("/health", (c) => {
//   console.log("Health endpoint hit");
//   return c.text("Everything Working Awesome!");
// });

// app
//   .route("/api", mandiDataRoute)
//   .route("/ai", streamChatController)
//   .route("/ai", aiChatController)
//   .route("/t", testROuter);
// // app.route("/ai", aiChatController);

// export default app;


import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

// controllers
import streamChatController from "./controllers/stream-chat";
import aiChatController from "./controllers/chat";
import testROuter from "./controllers/test";
import mongodb from "./config/db/mongodb";
import mandiDataRoute from "./controllers/market-prices";
import { setupDatasetAndExamples } from "./config/evaluation/dataset/example-dataset";

const app = new Hono();

/* ---------------- DB CONNECTION ---------------- */
(async () => {
  console.log("DB connection started");
  await mongodb.connect();
})();

/* ---------------- MIDDLEWARE ---------------- */
app.use("/*", cors());

/* ---------------- ROUTES ---------------- */
app.get("/health", (c) => {
  console.log("Health endpoint hit");
  return c.text("Everything Working Awesome!");
});

app
  .route("/api", mandiDataRoute)
  .route("/ai", streamChatController)
  .route("/ai", aiChatController)
  .route("/t", testROuter);

/* ---------------- SERVER START ---------------- */
const PORT = Number(process.env.PORT) || 3005;
Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(`🚀 Server running on http://localhost:${PORT}`);

export default app;

