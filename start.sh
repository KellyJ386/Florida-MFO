#!/bin/bash

# Quick start script for MAX Facility Operations

echo "🚀 Starting MAX Facility Operations..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "📝 Please copy .env.example to .env.local and add your Supabase credentials"
    echo ""
    echo "Run this command:"
    echo "  cp .env.example .env.local"
    echo ""
    echo "Then edit .env.local with your Supabase URL and key"
    exit 1
fi

# Check if contains placeholder values
if grep -q "YOUR_PROJECT_ID\|YOUR_ANON_KEY" .env.local; then
    echo "⚠️  Warning: .env.local still contains placeholder values!"
    echo "📝 Please update with your actual Supabase credentials"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

echo "✅ Configuration looks good!"
echo "🌐 Starting development server..."
echo ""
echo "📱 App will be available at: http://localhost:3000"
echo "🔐 Login at: http://localhost:3000/auth/login"
echo ""

npm run dev
