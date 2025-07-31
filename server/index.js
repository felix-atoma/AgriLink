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
import { resolvePath } from './utils/pathResolver.js';

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

// Add debug colors for better visibility
const colors = {
  reset: '\x1b[0m',
  success: '\x1b[32m',  // Green
  error: '\x1b[31m',    // Red
  info: '\x1b[36m',     // Cyan
  warning: '\x1b[33m'   // Yellow
};

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
  
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173']; // Default dev origins

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

  // Enhanced Route Loading System
  console.log(`${colors.info}\n🛣️  Starting route loading process...${colors.reset}`);

  const routeConfigs = [
    ['Authentication', '/api/v1/auth', './routes/authRoutes.js'],
    ['Products', '/api/v1/products', './routes/productRoutes.js'],
    ['Orders', '/api/v1/orders', './routes/orderRoutes.js'],
    ['Payments', '/api/v1/payment', './routes/paymentRoutes.js']
  ];

  for (const [name, pathPrefix, modulePath] of routeConfigs) {
    try {
      // Resolve and verify path exists
      const fullPath = resolvePath(modulePath);
      console.log(`${colors.info}⌛ Loading ${name} from: ${fullPath}${colors.reset}`);
      
      // Dynamic import with timeout
      const module = await Promise.race([
        import(fullPath),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Import timeout (5000ms) for ${modulePath}`)), 5000)
        )
      ]);
      
      // Validate module structure
      if (!module.default) {
        throw new Error(`Module ${modulePath} has no default export. Found keys: ${Object.keys(module).join(', ')}`);
      }
      
      if (typeof module.default !== 'function') {
        throw new Error(`Default export must be a router function. Got: ${typeof module.default}`);
      }
      
      // Mount the router
      app.use(pathPrefix, module.default);
      console.log(`${colors.success}✅ ${name} routes successfully mounted at ${pathPrefix}${colors.reset}`);
      
    } catch (err) {
      console.error(`${colors.error}❌ Failed to load ${name} routes:${colors.reset}`, err.message);
      console.error(`${colors.warning}Stack trace:${colors.reset}`, err.stack);
      
      // Add route that shows error status
      app.use(pathPrefix, (req, res) => {
        res.status(503).json({
          error: 'Route unavailable',
          message: `${name} routes failed to load`,
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      });
    }
  }

  // Add verification endpoint
  app.get('/api/v1/routes/status', (req, res) => {
    const loadedRoutes = routeConfigs.map(([name, path]) => ({
      name,
      path,
      status: app._router.stack.some(layer => layer.regexp.test(path)) 
        ? 'active' 
        : 'inactive'
    }));
    
    res.json({
      status: 'success',
      loadedRoutes,
      timestamp: new Date().toISOString()
    });
  });

  console.log(`${colors.success}🏁 Route loading completed${colors.reset}`);

  // Health Check Endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      routesStatus: `${req.protocol}://${req.get('host')}/api/v1/routes/status`
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
        description: name,
        status: `${req.protocol}://${req.get('host')}${path}/status`
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
      requestedUrl: req.originalUrl,
      availableEndpoints: [
        '/api/v1/health',
        '/api/v1/routes/status',
        ...routeConfigs.map(([_, path]) => path)
      ]
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