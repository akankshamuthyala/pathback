import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { seedDatabase } from './seed/seedData';
import { getSupabaseClient } from './services/supabaseService';

const startServer = async () => {
  try {
    console.log('==================================================');
    console.log('🏡 PathBack Backend API Engine Initializing...');
    console.log('   Finding a safer path back home.');
    console.log('   Consent-First Multimodal AI Platform');
    console.log('   Category: PS-16 Multimodal AI');
    console.log('==================================================');

    // 1. Connect Database
    await connectDatabase();

    // 2. Seed Synthetic Demonstration Data if configured
    if (env.DEMO_MODE) {
      await seedDatabase();
    }

    // 3. Create and start HTTP application
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 PathBack Backend API is running at: http://localhost:${env.PORT}`);
      console.log(`📡 Health Check endpoint:             http://localhost:${env.PORT}/api/health`);
      console.log(`🛡️  Dev OTP Mode:                      ${env.DEV_OTP_MODE ? 'ENABLED (Console Logged)' : 'DISABLED'}`);
      console.log(`🧪 Demo Synthetic Mode:              ${env.DEMO_MODE ? 'ACTIVE' : 'INACTIVE'}`);
      console.log('   Tagline: Finding a safer path back home.');
      console.log('==================================================\n');
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully terminating PathBack server...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Fatal error during backend startup:', error);
    process.exit(1);
  }
};

startServer();
