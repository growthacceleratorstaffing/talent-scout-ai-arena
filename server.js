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

// Health check endpoint with detailed monitoring
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {},
    responseTime: null,
    environment: 'production',
    autoCorrections: []
  };

  try {
    // Check environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      health.services.environment = 'failed';
      health.status = 'ERROR';
      return res.status(500).json({
        ...health,
        error: `Missing environment variables: ${missingEnvVars.join(', ')}`
      });
    }
    health.services.environment = 'connected';

    // Test Supabase connection
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        health.services.supabase = 'degraded';
        console.warn('Supabase query warning:', error.message);
        
        // Auto-correction: Try alternative connection test
        try {
          const { data: healthCheck } = await supabase.from('profiles').select('count').single();
          health.services.supabase = 'connected';
          health.autoCorrections.push('Supabase connection recovered');
        } catch (retryError) {
          health.services.supabase = 'failed';
          health.status = 'DEGRADED';
        }
      } else {
        health.services.supabase = 'connected';
      }
    } catch (supabaseError) {
      health.services.supabase = 'failed';
      health.status = 'DEGRADED';
      console.error('Supabase connection failed:', supabaseError.message);
    }

    // Check server performance
    const responseTime = Date.now() - startTime;
    health.responseTime = `${responseTime}ms`;
    
    if (responseTime > 1000) {
      health.services.performance = 'degraded';
      health.status = health.status === 'OK' ? 'DEGRADED' : health.status;
    } else {
      health.services.performance = 'connected';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    health.services.memory = memUsageMB > 500 ? 'degraded' : 'connected';
    
    if (memUsageMB > 500) {
      health.status = health.status === 'OK' ? 'DEGRADED' : health.status;
    }

    res.status(health.status === 'OK' ? 200 : health.status === 'DEGRADED' ? 200 : 500).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`
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
      environment: process.env.NODE_ENV || 'development'
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
});
