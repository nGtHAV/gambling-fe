#!/bin/bash

# COSC Casino Frontend Deployment Script
# Deploys Next.js frontend application using Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${1}${2}${NC}"
}

print_header() {
    echo ""
    print_message $BLUE "=============================================="
    print_message $BLUE "$1"
    print_message $BLUE "=============================================="
    echo ""
}

# Get script directory (gambling-fe/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Root directory (final/)
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Check Docker
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_message $RED "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_message $GREEN "✓ Docker is installed"
    
    if ! command -v docker compose &> /dev/null; then
        print_message $RED "Docker Compose is not installed."
        exit 1
    fi
    print_message $GREEN "✓ Docker Compose is installed"
    
    if ! docker info &> /dev/null; then
        print_message $RED "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_message $GREEN "✓ Docker daemon is running"
}

# Setup environment
setup_env() {
    print_header "Setting Up Environment"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            print_message $YELLOW "Creating .env file from .env.example..."
            cp .env.example .env
            print_message $GREEN "✓ .env file created"
            print_message $YELLOW "⚠ Please review NEXT_PUBLIC_API_URL in .env"
        else
            print_message $RED ".env.example not found. Please create .env manually."
            exit 1
        fi
    else
        print_message $GREEN "✓ .env file exists"
    fi
}

# Build and deploy frontend
deploy() {
    print_header "Deploying Frontend"
    
    print_message $YELLOW "Building frontend container..."
    docker compose build frontend
    print_message $GREEN "✓ Container built"
    
    print_message $YELLOW "Starting frontend..."
    docker compose up -d frontend
    print_message $GREEN "✓ Frontend started"
}

# Show status
show_status() {
    print_header "Frontend Status"
    
    docker compose ps frontend
    
    echo ""
    print_message $GREEN "=============================================="
    print_message $GREEN "  Frontend is running!"
    print_message $GREEN "=============================================="
    echo ""
    print_message $BLUE "Frontend: http://localhost:3000"
    echo ""
}

# Stop container
stop() {
    print_header "Stopping Frontend"
    docker compose stop frontend
    print_message $GREEN "✓ Frontend stopped"
}

# Rebuild
rebuild() {
    print_header "Rebuilding Frontend"
    docker compose stop frontend
    docker compose build --no-cache frontend
    docker compose up -d frontend
    print_message $GREEN "✓ Frontend rebuilt"
    show_status
}

# View logs
logs() {
    print_header "Viewing Frontend Logs"
    docker compose logs -f frontend
}

# Show help
show_help() {
    echo "COSC Casino Frontend Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  deploy      Deploy frontend"
    echo "  start       Start container"
    echo "  stop        Stop container"
    echo "  restart     Restart container"
    echo "  rebuild     Rebuild container"
    echo "  logs        View logs"
    echo "  status      Show status"
    echo "  help        Show this help"
    echo ""
}

# Main
case "${1:-deploy}" in
    deploy)
        check_docker
        setup_env
        deploy
        show_status
        ;;
    start)
        docker compose up -d frontend
        show_status
        ;;
    stop)
        stop
        ;;
    restart)
        docker compose restart frontend
        show_status
        ;;
    rebuild)
        check_docker
        rebuild
        ;;
    logs)
        logs
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_message $RED "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
