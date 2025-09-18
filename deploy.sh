#!/bin/bash

# UIW - One-command Docker deploy script
echo "🚀 Deploying UIW - Intimate Connection App"
echo "==========================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p database
mkdir -p backend/src
mkdir -p frontend/src
mkdir -p uploads

# Set permissions
chmod +x deploy.sh

# Download Piper TTS model
echo "🎤 Setting up Piper TTS model..."
mkdir -p piper_models
if [ ! -f "piper_models/en_US-lessac-medium.onnx" ]; then
    echo "Downloading Piper TTS model..."
    curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx" -o piper_models/en_US-lessac-medium.onnx
    curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json" -o piper_models/en_US-lessac-medium.onnx.json
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("postgres:5432" "minio:9000" "ollama:11434" "vocechat:3009" "openwebui:8080" "piper-tts:10200" "backend:3001" "frontend:3000")

for service in "${services[@]}"; do
    IFS=':' read -ra ADDR <<< "$service"
    name=${ADDR[0]}
    port=${ADDR[1]}
    
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $name is running on port $port"
    else
        echo "⚠️  $name may not be ready yet on port $port"
    fi
done

echo ""
echo "🎉 UIW deployment complete!"
echo ""
echo "📱 Access your app:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   VoceChat: http://localhost:3009"
echo "   OpenWebUI: http://localhost:8080"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "🔐 Default credentials:"
echo "   MinIO: minioadmin / minioadmin123"
echo ""
echo "📝 Next steps:"
echo "   1. Visit http://localhost:3000 to complete onboarding"
echo "   2. Create your user accounts (limited to 2 users)"
echo "   3. Start exploring the intimate features together"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: ./deploy.sh"