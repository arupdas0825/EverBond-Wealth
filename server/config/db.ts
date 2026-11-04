import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let isReconnecting = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      '[MongoDB] MONGODB_URI environment variable is missing in .env. Server will run in offline mode.'
    );
    return null;
  }

  // Sanitize URI if angle brackets were accidentally kept around username
  if (mongoUri.includes('<') && mongoUri.includes('>')) {
    mongoUri = mongoUri.replace(/<([^>]+)>/g, '$1');
  }

  try {
    mongoose.set('strictQuery', false);
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[MongoDB] Connecting to cluster (attempt ${attempt}/${maxRetries})...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 30000,
        });

        isConnected = true;
        console.log(
          `[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`
        );

        mongoose.connection.on('error', (err) => {
          console.warn('[MongoDB] Connection runtime error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('[MongoDB] Disconnected from database.');
          isConnected = false;
        });

        return conn;
      } catch (err: any) {
        if (err.message?.includes('querySrv') || err.message?.includes('ENOTFOUND')) {
          try {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
          } catch (_) {}
        }
        if (attempt === maxRetries) {
          console.warn(
            `[MongoDB] Cluster connection deferred (${err.message}). Local offline fallback is active.`
          );
          if (!isReconnecting) {
            isReconnecting = true;
            setTimeout(() => {
              isReconnecting = false;
              if (!isConnected && mongoose.connection.readyState !== 1) {
                connectDB().catch(() => {});
              }
            }, 30000);
          }
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    return null;
  } catch (error: any) {
    console.warn('[MongoDB] Connection warning:', error.message);
    return null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[MongoDB] Connection closed.');
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
