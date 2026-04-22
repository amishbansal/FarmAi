import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);

// import { Redis } from '@upstash/redis'

// exportconst redis = new Redis({
//   url: 'https://smashing-mallard-17430.upstash.io',
//   token: 'AUQWAAIjcDFlYWM2OTgyOGZmZTM0NDE3YTIzZDYxY2RlZjBjNjRiNXAxMA',
// })