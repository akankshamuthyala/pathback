import mongoose from 'mongoose';
import { env } from './env';

let mongodInstance: any = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    let mongoUri = env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '' || mongoUri.startsWith('mongodb-memory')) {
      console.log('⚡ No external MONGODB_URI provided. Initializing in-memory Mongo server for isolated zero-setup execution...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      mongoUri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB Server successfully spun up at: ${mongoUri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🚀 Connected to MongoDB at: ${mongoose.connection.host || 'in-memory instance'}`);
  } catch (error) {
    console.warn(`⚠️ Failed to connect to configured MongoDB URI (${env.MONGODB_URI}). Attempting in-memory fallback...`, error);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const fallbackUri = mongodInstance.getUri();
      await mongoose.connect(fallbackUri);
      console.log(`✅ Fallback in-memory MongoDB Server connected successfully at: ${fallbackUri}`);
    } catch (fallbackErr) {
      console.error('❌ Critical error connecting to MongoDB:', fallbackErr);
      throw fallbackErr;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
