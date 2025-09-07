// Mock API server for development
import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync } from 'fs';

const PORT = 8000;

// Mock data for responses
const mockData = {
  analysis: {
    id: 'mock-analysis-123',
    results: {
      overallScore: 85,
      sentiment: {
        label: 'positive',
        score: 0.78
      },
      clarity: 92,
      engagement: 88,
      keywords: ['communication', 'effective', 'presentation'],
      suggestions: [
        'Consider varying your pace more for emphasis',
        'Great use of clear articulation throughout'
      ]
    }
  }
};

// Create HTTP server
const server = createServer((req, res) => {
  const { pathname, query } = parse(req.url, true);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // API routes
  if (pathname === '/api/analysis' && req.method === 'POST') {
    // Mock file analysis endpoint
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(mockData.analysis));
    });
  } else {
    // Not found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});