const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Starting optimized GA-App server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'production');
console.log('🔌 Port:', port);

// Enable CORS with optimized settings
app.use(cors({
  origin: ['https://ga-app.azurewebsites.net', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Enable compression for better performance
app.use(compression({
  level: 6, // Balance between compression and CPU usage
  threshold: 1024 // Only compress files larger than 1KB
}));

// Optimized body parsing
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Lightweight metrics
let pingCount = 0;
let lastPing = new Date();
let healthChecks = 0;

// Optimized health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Lightweight endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow:');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response to save bandwidth
});

// Optimized API routes
app.get('/api/health', (req, res) => {
  healthChecks++;
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: healthChecks
  });
});

// Ultra-lightweight keep-alive endpoint
app.get('/api/keep-alive', (req, res) => {
  pingCount++;
  lastPing = new Date();
  res.status(200).json({
    status: 'alive',
    timestamp: lastPing.toISOString(),
    count: pingCount
  });
});

// Simplified monitoring endpoint
app.get('/api/monitoring/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      pingCount: pingCount,
      healthChecks: healthChecks
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files with optimized caching
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath, {
  maxAge: '7d', // Increased cache time
  etag: true, // Enable ETags for better caching
  lastModified: true
}));

// The "catchall" handler
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    }
  });
});

// Optimized keep-alive - reduced frequency
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes instead of 4
let keepAliveInterval;

function startInternalKeepAlive() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Starting optimized keep-alive mechanism');
    keepAliveInterval = setInterval(() => {
      const http = require('http');
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/api/keep-alive',
        method: 'GET',
        timeout: 3000 // Reduced timeout
      }, (res) => {
        // Minimal logging to reduce I/O
        if (res.statusCode !== 200) {
          console.warn(`Keep-alive issue: ${res.statusCode}`);
        }
      });

      req.on('error', () => {}); // Silent error handling
      req.on('timeout', () => req.destroy());
      req.end();
    }, KEEP_ALIVE_INTERVAL);
  }
}

// Start server
const server = app.listen(port, () => {
  console.log('✅ GA-App server is running on port', port);
  console.log('🔧 Environment check:');
  console.log('   - SUPABASE_URL:', !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL));
  console.log('   - SUPABASE_ANON_KEY:', !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY));
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('   - Static files served from:', staticPath);
  console.log('🎯 Server ready to accept connections');
  
  // Start internal keep-alive after server is ready
  startInternalKeepAlive();
});

// Handle server startup errors
server.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown handlers
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  // Clear keep-alive interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    console.log('🔄 Internal keep-alive stopped');
  }
  
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
