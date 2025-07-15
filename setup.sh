#!/bin/bash

# Jarvis AI Assistant Setup Script
# This script sets up the necessary environment files for the project

echo "🤖 Setting up Jarvis AI Assistant..."
echo "=================================="

# Create backend .env file
echo "Setting up backend environment..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.template backend/.env
    echo "✅ Created backend/.env from template"
else
    echo "⚠️  backend/.env already exists"
fi

# Create frontend .env file
echo "Setting up frontend environment..."
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.template frontend/.env
    echo "✅ Created frontend/.env from template"
else
    echo "⚠️  frontend/.env already exists"
fi

echo ""
echo "🔧 IMPORTANT: Configure the following settings:"
echo "=================================="
echo "1. Edit backend/.env and set your JWT_SECRET_KEY"
echo "2. Edit frontend/.env and set your REACT_APP_BACKEND_URL"
echo "3. Configure your OpenAI API key in the app after login"
echo "4. Configure your SMTP settings in the app after login"
echo ""
echo "💡 Note: The .env files are ignored by Git to protect your secrets"
echo "🚀 Run 'sudo supervisorctl restart all' to apply changes"
echo ""
echo "Setup complete! 🎉"