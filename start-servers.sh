#!/bin/bash

echo "Stopping any existing servers..."
pkill -f "vite|ts-node|concurrently" 2>/dev/null
sleep 2

echo "Starting backend server..."
cd /Users/mikemanner/Desktop/Landfello
npm run dev:backend > backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting frontend server..."
cd /Users/mikemanner/Desktop/Landfello/frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Waiting for servers to start..."
sleep 5

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "Checking if servers are running..."
if ps -p $BACKEND_PID > /dev/null; then
  echo "✅ Backend server is running (PID: $BACKEND_PID)"
else
  echo "❌ Backend server failed to start"
  echo "Backend logs:"
  tail -20 backend.log
fi

if ps -p $FRONTEND_PID > /dev/null; then
  echo "✅ Frontend server is running (PID: $FRONTEND_PID)"
  echo "Frontend should be available at: http://localhost:5173"
else
  echo "❌ Frontend server failed to start"
  echo "Frontend logs:"
  tail -20 ../frontend.log
fi

echo ""
echo "To view logs in real-time:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop servers: pkill -f 'vite|ts-node'"


