#!/bin/bash

# Start the Vite development server
echo "Starting StackIt Frontend Development Server..."
echo "Make sure you have Node.js and npm installed."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server on http://localhost:5173"
npm run dev 