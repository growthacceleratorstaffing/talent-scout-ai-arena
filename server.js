const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Starting GA-App server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'production');
console.log('🔌 Port:', port);

// Enable CORS
app.use(cors({
  origin: ['https://ga-app.azurewebsites.net', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Keep-alive ping counter
let pingCount = 0;
let lastPing = new Date();

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    port: port,
    env: process.env.NODE_ENV || 'production'
  });
});

// Additional health endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow:');
});

app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'dist', 'favicon.ico');
  res.sendFile(faviconPath, (err) => {
    if (err) {
      res.status(204).end();
    }
  });
});

// API routes
app.get('/api/health', (req, res) => {
  pingCount++;
  lastPing = new Date();
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'running',
    port: port,
    pingCount: pingCount,
    lastPing: lastPing.toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Keep-alive endpoint - responds immediately to prevent cold starts
app.get('/api/keep-alive', (req, res) => {
  pingCount++;
  lastPing = new Date();
  
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pingCount: pingCount
  });
});

// Monitoring endpoint
app.get('/api/monitoring/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
      pingCount: pingCount,
      lastPing: lastPing.toISOString(),
      environmentVars: {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
        port: port
      }
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the React app
const staticPath = path.join(__dirname, 'dist');
console.log('📁 Serving static files from:', staticPath);

app.use(express.static(staticPath, {
  maxAge: '1d',
  etag: false
}));

// The "catchall" handler: send back React's index.html file for any request that doesn't match above
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('🔄 Serving index.html for route:', req.path);
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err);
        res.status(500).send('Internal Server Error - Could not serve application');
      }
    });
  } catch (error) {
    console.error('❌ Error in catchall handler:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Internal keep-alive mechanism - ping self every 4 minutes
const KEEP_ALIVE_INTERVAL = 4 * 60 * 1000; // 4 minutes
let keepAliveInterval;

function startInternalKeepAlive() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Starting internal keep-alive mechanism');
    keepAliveInterval = setInterval(() => {
      // Self-ping to prevent Azure from sleeping the app
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/keep-alive',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        console.log(`💓 Keep-alive ping: ${res.statusCode}`);
      });

      req.on('error', (err) => {
        console.error('💓 Keep-alive ping failed:', err.message);
      });

      req.on('timeout', () => {
        console.error('💓 Keep-alive ping timeout');
        req.destroy();
      });

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
