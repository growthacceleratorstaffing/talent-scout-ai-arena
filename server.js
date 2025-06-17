
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Simple health check endpoint for Azure
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {},
    responseTime: null,
    environment: process.env.NODE_ENV || 'production',
    autoCorrections: []
  };

  try {
    // Check basic server health first
    health.services.server = 'connected';
    
    // Check if we're in Azure (basic environment check)
    health.services.environment = 'connected';
    
    // Only check Supabase if environment variables are available
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        // Test Supabase connection with a timeout
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Simple auth check with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase timeout')), 5000)
        );
        
        const healthCheckPromise = supabase.auth.getUser();
        
        await Promise.race([healthCheckPromise, timeoutPromise]);
        health.services.supabase = 'connected';
      } catch (supabaseError) {
        health.services.supabase = 'degraded';
        console.warn('Supabase connection warning:', supabaseError.message);
        // Don't fail the entire health check for Supabase issues
      }
    } else {
      health.services.supabase = 'not_configured';
      console.log('Supabase not configured - using local mode');
    }

    // Check server performance
    const responseTime = Date.now() - startTime;
    health.responseTime = `${responseTime}ms`;
    
    if (responseTime > 2000) {
      health.services.performance = 'degraded';
    } else {
      health.services.performance = 'connected';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    health.services.memory = memUsageMB > 500 ? 'degraded' : 'connected';
    
    // Always return 200 OK for Azure health checks unless there's a critical server error
    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    // Even on error, return 200 with error details for debugging
    res.status(200).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`,
      services: {
        server: 'connected',
        error_details: error.message
      }
    });
  }
});

// Monitoring endpoint for detailed metrics
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
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment check:');
  console.log('- SUPABASE_URL:', !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL));
  console.log('- SUPABASE_ANON_KEY:', !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY));
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
});
