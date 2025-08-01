#!/bin/bash

echo "Installing Care Connect Backend Dependencies..."
npm install

echo ""
echo "Creating .env file from template..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Please edit .env file with your configuration"
else
    echo ".env file already exists"
fi

echo ""
echo "Starting MongoDB (if not already running)..."
echo "Please ensure MongoDB is installed and running on your system"

echo ""
echo "Starting Care Connect Backend Server..."
npm run dev 