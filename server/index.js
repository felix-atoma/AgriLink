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

  // Core Middleware
 // ... (previous imports remain the same)

// Core Middleware - Updated CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://agrilink-client-5h39-git-main-felix-atomas-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ... (rest of the code remains the same)
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
  } else {
    const logger = (await import('./utils/logger.js')).default;
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));
    console.log('📝 Production logging enabled');
  }

  // Internationalization
  try {
    const { detectLanguage } = await import('./middleware/language.js');
    app.use(detectLanguage);
    console.log('🌐 Language middleware mounted');
  } catch (i18nError) {
    console.warn('⚠️  Language middleware failed, using fallback');
    app.use((req, res, next) => {
      req.language = 'en';
      next();
    });
  }

  // Static Files
  const uploadsPath = path.join(__dirname, 'uploads');
  try {
    await fs.access(uploadsPath);
    app.use('/uploads', express.static(uploadsPath));
    console.log(`📁 Serving static files from: ${uploadsPath}`);
  } catch {
    console.warn(`⚠️  Uploads directory not found: ${uploadsPath}`);
  }

  // Route Loading
  console.log('\n🛣️  Loading routes:');
  const routeConfigs = [
    ['Authentication', '/api/v1/auth', './routes/authRoutes.js'],
    ['Products', '/api/v1/products', './routes/productRoutes.js'],
    ['Orders', '/api/v1/orders', './routes/orderRoutes.js'],
    ['Payments', '/api/v1/payment', './routes/paymentRoutes.js']
  ];

  for (const [name, pathPrefix, modulePath] of routeConfigs) {
    try {
      const router = (await import(modulePath)).default;
      app.use(pathPrefix, router);
      console.log(`- ${name}: ${pathPrefix}`);
    } catch (err) {
      console.error(`❌ Failed to load ${name} routes:`, err.message);
    }
  }

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

  // Documentation endpoint
  app.get('/docs', (req, res) => {
    res.json({
      apiVersion: '1.0.0',
      endpoints: [
        {
          path: '/api/v1/auth',
          methods: ['POST', 'GET'],
          description: 'User authentication'
        },
        {
          path: '/api/v1/products',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Product management'
        }
        // Add more endpoint documentation as needed
      ]
    });
  });

  // Health Check Endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      language: req.language || 'en',
      uptime: process.uptime()
    });
  });

  // Error Handling
  try {
    const { notFound, errorHandler } = await import('./middleware/errorHandler.js');
    app.use(notFound);
    app.use(errorHandler);
    console.log('\n⚠️  Error handlers mounted');
  } catch (err) {
    console.error('❌ Error handler loading failed:', err.message);
    app.use((err, req, res, next) => {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
  }

  // Server Startup
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n----------------------------------------');
    console.log('🚀 Server successfully started');
    console.log(`🔗 http://localhost:${PORT}`);
    console.log('----------------------------------------\n');
  });

  // Graceful shutdown handlers
  process.on('unhandledRejection', (err) => {
    console.error('🔥 Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });

} catch (startupError) {
  console.error('\n‼️  FATAL STARTUP ERROR:', startupError.message);
  console.error(startupError.stack);
  process.exit(1);
}