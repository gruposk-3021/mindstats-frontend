const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint para Digital Ocean
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// SPA routing - todas as rotas retornam index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

