const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP Requests',
  labelNames: ['method', 'endpoint', 'http_status'],
  registers: [register]
});

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP Request Latency',
  labelNames: ['method', 'endpoint'],
  registers: [register]
});

app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || 'none';
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    if (req.path !== '/metrics' && req.path !== '/health' && req.path !== '/ready') {
      requestCounter.labels(req.method, req.path, res.statusCode).inc();
      requestDuration.labels(req.method, req.path).observe(duration);
    }
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'gateway',
      level: 'INFO',
      request_id: requestId,
      message: `${req.method} ${req.path} responded ${res.statusCode} in ${duration.toFixed(4)}s`
    }));
  });
  next();
});

app.use('/api/v1/auth', createProxyMiddleware({ target: 'http://auth-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/auth': ''} }));
app.use('/api/v1/users', createProxyMiddleware({ target: 'http://users-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/users': ''} }));
app.use('/api/v1/products', createProxyMiddleware({ target: 'http://products-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/products': ''} }));
app.use('/api/v1/orders', createProxyMiddleware({ target: 'http://orders-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/orders': ''} }));
app.use('/api/v1/payment', createProxyMiddleware({ target: 'http://payment-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/payment': ''} }));
app.use('/api/v1/notification', createProxyMiddleware({ target: 'http://notification-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/notification': ''} }));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'gateway' }));
app.get('/ready', (req, res) => res.json({ status: 'ready', service: 'gateway' }));
app.get('/version', (req, res) => res.json({ version: '0.1.0', service: 'gateway' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`API Gateway proxy running on port ${PORT}`);
});