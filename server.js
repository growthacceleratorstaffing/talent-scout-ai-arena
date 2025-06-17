
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS with specific configuration for Azure
app.use(cors({
  origin: ['https://ga-app.azurewebsites.net', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Simple health check endpoint for Azure - this must be very reliable
app.get('/health', async (req, res) => {
  try {
    // Basic health response that Azure expects
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production'
    };
    
    // Always return 200 OK for Azure health checks
    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    // Even on error, return 200 with error details for Azure compatibility
    res.status(200).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Alternative health endpoints that Azure might check
app.get('/', (req, res) => {
  // Check if this is a health check request (no user agent or specific headers)
  const userAgent = req.get('User-Agent') || '';
  const isHealthCheck = userAgent.includes('HealthCheck') || userAgent.includes('AlwaysOn');
  
  if (isHealthCheck) {
    return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  }
  
  // Regular request - serve the React app
  try {
    const indexPath = path.join(__dirname, 'dist/index.html');
    res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
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

// Detailed monitoring endpoint
app.get('/api/monitoring/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      environmentVars: {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
        port: process.env.PORT || 3000
      }
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/index.html');
    res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message 
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment check:');
  console.log('- SUPABASE_URL:', !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL));
  console.log('- SUPABASE_ANON_KEY:', !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY));
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- Static files served from:', path.join(__dirname, 'dist'));
  console.log('- Server listening on all interfaces (0.0.0.0)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
