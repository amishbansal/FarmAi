import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const dbQueryTime = new Trend("database_execution_time");

export let options = {
  vus: 100, // Virtual Users
  duration: "10s", // Test Duration
};

export default function () {
  let res = http.get("http://localhost:3000/t/test");

  let jsonRes;
  try {
    jsonRes = JSON.parse(res.body);
  } catch (e) {
    jsonRes = {};
  }

  if (jsonRes.data) {
    dbQueryTime.add(parseFloat(jsonRes.data)); // Add DB exec time to K6 Trend
  }

  check(res, {
    "status is 200": (r) => r.status === 200,
    "DB execution time < 200ms": () => parseFloat(jsonRes.data) < 200,
  });

  sleep(1);
}
