import mongoose from 'mongoose';

// MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jirant';

// Cached variables for Mongoose and the raw MongoDB client
let cachedMongooseConn: mongoose.Mongoose | null = null;
let cachedMongoClientPromise: Promise<any> | null = null;

/**
 * Connect to MongoDB with Mongoose
 * This function is used for general database operations with Mongoose models.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedMongooseConn) {
    console.log('Using cached Mongoose connection');
    return cachedMongooseConn;
  }

  console.log('Establishing new Mongoose connection...');
  cachedMongooseConn = await mongoose.connect(MONGO_URI);
  console.log('Mongoose connected successfully');
  return cachedMongooseConn;
}

/**
 * Get the MongoDB client for NextAuth.js
 * This function is used by NextAuth's MongoDB adapter.
 */
export function getMongoClient(): Promise<any> {
  if (!cachedMongoClientPromise) {
    console.log('Establishing MongoDB client connection...');
    cachedMongoClientPromise = mongoose.connect(MONGO_URI).then((mongooseConnection) => {
      console.log('MongoDB client connected successfully');
      return mongooseConnection.connection.getClient(); // Return raw MongoDB client
    });
  }
  return cachedMongoClientPromise;
}