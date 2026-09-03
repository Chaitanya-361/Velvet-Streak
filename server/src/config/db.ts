import mongoose from 'mongoose';
import { env } from './env';
import { badgeSeedData } from '../data/badges';
import { Badge } from '../models/Badge';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedBadges();
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${(error as Error).message}`);
    
    if (env.NODE_ENV === 'development') {
      console.log('Starting in-memory fallback database...');
      try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`Fallback In-Memory MongoDB Connected at: ${mongoUri}`);
        await seedBadges();
      } catch (fallbackError) {
        console.error(`Fallback connection also failed: ${fallbackError}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

async function seedBadges() {
  try {
    const count = await Badge.countDocuments();
    if (count === 0) {
      console.log('Seeding initial badges...');
      await Badge.insertMany(badgeSeedData);
      console.log('Badges seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding badges:', error);
  }
}
