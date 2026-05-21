import mongoose from 'mongoose';
import { env } from './env';
import { badgeSeedData } from '../data/badges';
import { Badge } from '../models/Badge';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedBadges();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
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
