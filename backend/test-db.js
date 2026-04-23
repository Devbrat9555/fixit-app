const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Testing URI:', uri);

async function run() {
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
