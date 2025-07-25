// Top-level startup logging
console.log('🚀 Starting server initialization...');
console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`🛠️  Node.js ${process.version}\n`);

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Initialize dynamic __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (silent mode)
dotenv.config({ override: true, debug: false });
console.log('🔧 Environment variables loaded');

// Verify critical environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`- ${varName}`));
  process.exit(1);
}

// Configuration summary
console.log('\n⚙️  Configuration:');
console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`- Client URL: ${process.env.CLIENT_URL || 'Not configured'}`);
console.log(`- MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Missing'}\n`);

try {
  // Initialize Express
  const app = express();
  console.log('✅ Express application initialized');

  // Database Connection
  console.log('🔗 Connecting to MongoDB...');
  const connectDB = (await import('./config/db.js')).default;
  await connectDB();
  console.log('📚 MongoDB connection established\n');

  // Core Middleware - Updated CORS configuration
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://agrilink-client-5h39-git-main-felix-atomas-projects.vercel.app'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
  console.log('🧩 Core middleware mounted');

  // HTTP Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('📝 Development logging enabled (Morgan)');
  }

  // Create required directories
  const requiredDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'locales')
  ];

  await Promise.all(requiredDirs.map(async dir => {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.warn(`⚠️  Could not create directory ${dir}:`, err.message);
      }
    }
  }));

  // Static Files
  const uploadsPath = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(`📁 Serving static files from: ${uploadsPath}`);

  // Route Loading - Improved with dynamic imports
  console.log('\n🛣️  Loading routes:');
  const routeConfigs = [
    ['Authentication', '/api/v1/auth', './routes/authRoutes.js'],
    ['Products', '/api/v1/products', './routes/productRoutes.js'],
    ['Orders', '/api/v1/orders', './routes/orderRoutes.js'],
    ['Payments', '/api/v1/payment', './routes/paymentRoutes.js']
  ];

  for (const [name, pathPrefix, modulePath] of routeConfigs) {
    try {
      // Resolve full path to the module
      const fullPath = path.join(__dirname, modulePath);
      console.log(`- Attempting to load ${name} from: ${fullPath}`);
      
      const module = await import(fullPath);
      if (!module.default) {
        throw new Error(`Module ${modulePath} has no default export`);
      }
      
      app.use(pathPrefix, module.default);
      console.log(`✅ ${name} routes mounted at ${pathPrefix}`);
    } catch (err) {
      console.error(`❌ Failed to load ${name} routes:`, err.message);
      console.error(err.stack);
    }
  }

  // Health Check Endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to AgriLink API',
      version: '1.0.0',
      status: 'operational',
      documentation: `${req.protocol}://${req.get('host')}/docs`,
      healthCheck: `${req.protocol}://${req.get('host')}/api/v1/health`,
      availableRoutes: routeConfigs.map(([name, path]) => ({
        path,
        description: name
      }))
    });
  });

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error('⚠️  Error:', err.message);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      requestedUrl: req.originalUrl
    });
  });

  // Server Startup
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n----------------------------------------');
    console.log('🚀 Server successfully started');
    console.log(`🔗 http://localhost:${PORT}`);
    console.log('----------------------------------------\n');
  });

} catch (startupError) {
  console.error('\n‼️  FATAL STARTUP ERROR:', startupError.message);
  console.error(startupError.stack);
  process.exit(1);
}