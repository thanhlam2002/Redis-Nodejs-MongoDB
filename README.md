# Redis-Nodejs-MongoDB

# 📌 Bài tập: So sánh thời gian truy vấn dữ liệu trước và sau khi sử dụng Redis Cache với MongoDB + Node.js

## 📂 Cấu trúc thư mục

```
SLOT 4 NODEJS/
├── .env
├── db.js
├── query.js
├── redisClient.js
├── utils.js
├── package.json
└── node_modules/
```

## 🧠 Mục tiêu bài tập

1. Kết nối đến MongoDB và Redis.
2. Truy vấn dữ liệu từ MongoDB (`collection: test-redis`, database: `Slot4NodeJS`).
3. Lưu dữ liệu vào Redis Cache.
4. So sánh **thời gian truy vấn lần đầu (Mongo)** và **lần 2 (Redis)**.

## ⚙️ Cài đặt môi trường

1. Cài Node.js: https://nodejs.org  
2. Cài Redis: https://github.com/tporadowski/redis/releases *(Redis cho Windows)*

## 📄 Nội dung các file

### `.env` – Biến môi trường

```env
MONGO_URI=mongodb://localhost:27017/Slot4NodeJS
REDIS_URL=redis://localhost:6379
```

### `db.js` – Kết nối MongoDB

```js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("Slot4NodeJS");

module.exports = async function connectMongo() {
  await client.connect();
  console.log("✅ Đã kết nối MongoDB");
  return db.collection("test-redis");
};
```

### `redisClient.js` – Kết nối Redis

```js
const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("❌ Redis error", err));
client.on("connect", () => console.log("✅ Đã kết nối Redis"));

client.connect();

module.exports = client;
```

### `utils.js` – Đo thời gian

```js
function timerStart() {
  return process.hrtime(); // nano giây
}

function timerEnd(startTime) {
  const diff = process.hrtime(startTime);
  return (diff[0] * 1e9 + diff[1]) / 1e6; // đổi ra milliseconds
}

module.exports = { timerStart, timerEnd };
```

### `query.js` – Truy vấn dữ liệu và so sánh thời gian

```js
const connectMongo = require("./db");
const redisClient = require("./redisClient");
const { timerStart, timerEnd } = require("./utils");

async function main() {
  const collection = await connectMongo();
  const CACHE_KEY = "test-redis-all";

  // Truy vấn lần 1 (không có cache)
  let start = timerStart();
  let cacheData = await redisClient.get(CACHE_KEY);

  if (cacheData) {
    console.log("📦 Lấy từ Redis cache");
    JSON.parse(cacheData);
  } else {
    const data = await collection.find({}).toArray();
    await redisClient.set(CACHE_KEY, JSON.stringify(data));
    console.log("📦 Lấy từ Mongo và cache vào Redis");
  }

  let duration1 = timerEnd(start);
  console.log(`⏱️ Truy vấn lần 1 mất: ${duration1.toFixed(2)} ms`);

  // Truy vấn lần 2 (đã có cache)
  start = timerStart();
  const data2 = await redisClient.get(CACHE_KEY);
  JSON.parse(data2);
  let duration2 = timerEnd(start);
  console.log(`⏱️ Truy vấn lần 2 (Redis cache) mất: ${duration2.toFixed(2)} ms`);

  process.exit(0);
}

main();
```

## 🚀 Chạy chương trình

```bash
npm install
node query.js
```

## 📊 Kết quả mong đợi

```
✅ Đã kết nối Redis
✅ Đã kết nối MongoDB
📦 Lấy từ Mongo và cache vào Redis
⏱️ Truy vấn lần 1 mất: 85.42 ms
⏱️ Truy vấn lần 2 (Redis cache) mất: 1.32 ms
```

## 📌 Kết luận

| Nguồn dữ liệu     | Thời gian (ms) |
|------------------|----------------|
| MongoDB (Lần đầu) | Cao hơn        |
| Redis (Lần sau)   | Rất nhanh      |

✅ Redis giúp cải thiện hiệu suất đáng kể khi đọc dữ liệu lớn nhiều lần.
