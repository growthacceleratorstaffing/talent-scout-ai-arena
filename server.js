
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Starting server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', port);

// Enable CORS with specific configuration
app.use(cors({
  origin: ['https://ga-app.azurewebsites.net', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the React app
const staticPath = path.join(__dirname, 'dist');
console.log('📁 Serving static files from:', staticPath);

app.use(express.static(staticPath, {
  maxAge: '1d',
  etag: false,
  index: false // Don't auto-serve index.html for static routes
}));

// Azure health check endpoint - must be very simple and reliable
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    port: port
  });
});

// Additional health endpoints for Azure monitoring
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow:');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'running',
    port: port
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

// The "catchall" handler: for any request that doesn't match above, send back React's index.html file
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err);
        res.status(500).send('Internal Server Error');
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

// Start server on all interfaces for Azure
const server = app.listen(port, '0.0.0.0', () => {
  console.log('✅ Server is running on port', port);
  console.log('🔧 Environment check:');
  console.log('   - SUPABASE_URL:', !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL));
  console.log('   - SUPABASE_ANON_KEY:', !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY));
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('   - Static files served from:', staticPath);
  console.log('🎯 Server ready to accept connections');
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
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
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
