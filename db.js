const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
const dbName = "Slot4NodeJS";

async function connectMongo() {
  await client.connect();
  console.log("✅ Đã kết nối MongoDB");
  return client.db(dbName).collection("test-redis");
}

module.exports = connectMongo;
