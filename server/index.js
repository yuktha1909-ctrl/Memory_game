const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const apiRoutes = require('./routes');
const { initDb, DB_PATH } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB schema & defaults
initDb();

// Request logger for development / production
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MEMORY MATCH Server',
    database: `SQLite (${DB_PATH})`,
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets from client/dist in production
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for non-API client routes
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Fallback 404 for undefined /api routes (or when client/dist isn't built yet)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: 'Internal server error: ' + err.message });
});

// Only listen if not imported in tests
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🎮 MEMORY MATCH Server running on port ${PORT}`);
    console.log(`📦 Database: SQLite (${DB_PATH})`);
    console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
    if (fs.existsSync(clientDistPath)) {
      console.log(`🎨 Serving React frontend from client/dist`);
    } else {
      console.log(`⚠️ Client dist not found at ${clientDistPath} (run 'npm run build' for production)`);
    }
    console.log(`===============================================`);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  });
}

module.exports = app;

