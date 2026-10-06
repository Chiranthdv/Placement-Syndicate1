import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

dotenv.config({ path: '../../.env' });

const app = express();
const port = 8200;

app.use(cors({ origin: 'http://localhost:3000' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'api-gateway' }));

const authMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mini-project-local-dev-secret-change-this-32');
    req.headers['x-user-id'] = decoded.sub;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-name'] = decoded.name;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/api/users', authMiddleware, createProxyMiddleware({ target: 'http://localhost:8081', changeOrigin: true }));
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:8081', changeOrigin: true }));
app.use('/api/experience', authMiddleware, createProxyMiddleware({ target: 'http://localhost:8082', changeOrigin: true }));
app.use('/api/resume', authMiddleware, createProxyMiddleware({ target: 'http://localhost:8050', changeOrigin: true }));

app.use((err, req, res, next) => {
  console.error('[' + new Date().toISOString() + '] Gateway Error:', err);
  res.status(500).json({ error: 'Internal Gateway Error' });
});

const server = app.listen(port, () => {
  console.log('[' + new Date().toISOString() + '] API Gateway running on port ' + port);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
