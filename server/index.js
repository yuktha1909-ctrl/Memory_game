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

// Request logger
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'test') {
      const duration = Date.now() - start;
      console.log(
        `[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
      );
    }
  });

  next();
});

// Initialize database
if (process.env.NODE_ENV !== 'test') {
  initDb();
}

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MEMORY MATCH Server',
    database: `SQLite (${DB_PATH})`,
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve React frontend in production
const clientDistPath = path.resolve(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // React SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.sendFile(
      path.join(clientDistPath, 'index.html'),
      (err) => {
        if (err) next(err);
      }
    );
  });
}

// API and general 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('===============================================');
    console.log(`MEMORY MATCH Server running on port ${PORT}`);
    console.log(`Database: SQLite (${DB_PATH})`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);

    if (fs.existsSync(clientDistPath)) {
      console.log('Serving React frontend from client/dist');
    } else {
      console.log('React frontend build not found');
    }

    console.log('===============================================');
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;