const db = require('./data/db.json');
const cars = Object.values(db.repos).find(r => r.repoName === 'CARS');
if (!cars) { console.log('No CARS repo'); process.exit(1); }

// Find a TS/JS file node to see if it even parsed it correctly
const nodes = cars.graphData.nodes.filter(n => n.id.endsWith('.ts') || n.id.endsWith('.tsx'));
console.log('TS/TSX files count:', nodes.length);
console.log('Sample node:', nodes[0]);

// wait, parsedFiles is not in db.json!
// But we can just test the regex on a sample string
const code = `
import React, { 
  useState 
} from 'react';
import { Card } from "@/components/ui/card";
import './index.css';
`;

const importRegex = /import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gs;
let match;
while ((match = importRegex.exec(code)) !== null) {
  console.log('Found import:', match[1]);
}
