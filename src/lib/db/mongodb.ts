import { MongoClient, type Db } from "mongodb";

/**
 * Cached MongoDB client. In dev, the connection is cached on `globalThis` so
 * hot-reloads don't open a new connection every time. In production a single
 * module-scoped promise is reused across invocations.
 */

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "exzelon";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
