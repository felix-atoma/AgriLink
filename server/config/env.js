import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before anything else
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = ['NAME_MIN_LENGTH', 'JWT_SECRET', 'MONGODB_URI'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log('✅ Environment variables loaded successfully');