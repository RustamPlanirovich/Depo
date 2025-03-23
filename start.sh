#!/bin/bash

# Stop any existing servers on ports 3000 and 3001
echo "Stopping any existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Wait a moment to ensure ports are freed
sleep 2

# Ensure we have all dependencies
echo "Installing dependencies..."
npm install

# Create data file directory if it doesn't exist
echo "Checking data file..."
touch deposit-tracker-data.json
chmod 644 deposit-tracker-data.json

# Start the application with server and client
echo "Starting the Deposit Tracker..."
npm start

# Show instructions
echo ""
echo "Application started!"
echo "React client: http://localhost:3000"
echo "Express server: http://localhost:3001"
echo "Data file: $(pwd)/deposit-tracker-data.json"
