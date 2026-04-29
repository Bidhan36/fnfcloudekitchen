#!/bin/bash
set -e

echo "🚀 Starting Social Media Tracker..."

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root deps..."
  npm install
fi

if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server deps..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client deps..."
  cd client && npm install && cd ..
fi

echo ""
echo "✅ Starting servers..."
echo "   API  → http://localhost:3001"
echo "   App  → http://localhost:3000"
echo ""
echo "Open http://localhost:3000 in your browser."
echo "Press Ctrl+C to stop."
echo ""

npm run dev
