// --- Frontend Entrypoint Stub ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: "online",
    service: "frontend-application-skeleton",
    message: "Welcome to the DevOps Nexus Microservice Frontend portal."
  });
});

app.listen(PORT, () => {
  console.log(`Frontend service running on port ${PORT}`);
});
