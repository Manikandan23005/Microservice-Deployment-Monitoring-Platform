// --- API Gateway Ingress Router Stub ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  console.log(`[GATEWAY PROXY] [${req.method}] ${req.url} - Forwarding...`);
  next();
});

app.get('/healthz', (req, res) => {
  res.json({ status: "healthy", service: "gateway" });
});

// Proxy stubs to internal services
app.all('/api/v1/auth*', (req, res) => {
  res.json({ message: "Forwarded to Auth service (stub)" });
});

app.all('/api/v1/users*', (req, res) => {
  res.json({ message: "Forwarded to Users service (stub)" });
});

app.all('/api/v1/products*', (req, res) => {
  res.json({ message: "Forwarded to Products service (stub)" });
});

app.all('/api/v1/orders*', (req, res) => {
  res.json({ message: "Forwarded to Orders service (stub)" });
});

app.listen(PORT, () => {
  console.log(`API Gateway proxy running on port ${PORT}`);
});
