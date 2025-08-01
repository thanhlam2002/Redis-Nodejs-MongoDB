const connectMongo = require("./db");
const redisClient = require("./redisClient");
const { timerStart, timerEnd } = require("./utils");

async function main() {
  const collection = await connectMongo();
  const CACHE_KEY = "test-redis-all";

  // Truy vấn lần 1: Không dùng cache
  let start = timerStart();
  let cacheData = await redisClient.get(CACHE_KEY);

  if (cacheData) {
    console.log("📦 Lấy từ Redis cache");
    JSON.parse(cacheData); // sử dụng cache nếu có
  } else {
    const data = await collection.find({}).toArray();
    await redisClient.set(CACHE_KEY, JSON.stringify(data));
    console.log("📦 Lấy từ Mongo và cache vào Redis");
  }

  let duration1 = timerEnd(start);
  console.log(`⏱️ Truy vấn lần 1 mất: ${duration1.toFixed(2)} ms`);

  // Truy vấn lần 2: Redis có cache
  start = timerStart();
  const data2 = await redisClient.get(CACHE_KEY);
  JSON.parse(data2);
  let duration2 = timerEnd(start);
  console.log(`⏱️ Truy vấn lần 2 (Redis cache) mất: ${duration2.toFixed(2)} ms`);

  process.exit(0);
}

main();
