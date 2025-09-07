#!/bin/bash

# Intelligent Automation Service Startup Script

echo "🤖 Starting Intelligent Automation Service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create models directory
mkdir -p models

# Start the service
echo "Starting Intelligent Automation Service on port 8012..."
cd src
uvicorn main:app --host 0.0.0.0 --port 8012
