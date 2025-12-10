#!/bin/bash

# COSC Casino Frontend Deployment Script
# Deploys Next.js frontend application

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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check Node.js
check_node() {
    print_header "Checking Node.js Installation"
    
    if ! command -v node &> /dev/null; then
        print_message $RED "Node.js is not installed."
        print_message $YELLOW "Install Node.js 18+ from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_message $GREEN "✓ Node.js $NODE_VERSION found"
    
    if ! command -v npm &> /dev/null; then
        print_message $RED "npm is not installed."
        exit 1
    fi
    print_message $GREEN "✓ npm found"
}

# Install dependencies
install_deps() {
    print_header "Installing Dependencies"
    
    npm install
    print_message $GREEN "✓ Dependencies installed"
}

# Setup environment
setup_env() {
    print_header "Setting Up Environment"
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# For production, change to your backend URL:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
EOF
        print_message $GREEN "✓ .env.local file created"
        print_message $YELLOW "⚠ Edit .env.local if backend is on different URL"
    else
        print_message $GREEN "✓ .env.local file exists"
    fi
}

# Build for production
build_prod() {
    print_header "Building for Production"
    
    npm run build
    print_message $GREEN "✓ Production build complete"
}

# Start development server
start_dev() {
    print_header "Starting Development Server"
    
    print_message $GREEN "Starting Next.js development server..."
    print_message $BLUE "Frontend running at: http://localhost:3000"
    print_message $YELLOW "Press Ctrl+C to stop"
    echo ""
    npm run dev
}

# Start production server
start_prod() {
    print_header "Starting Production Server"
    
    if [ ! -d ".next" ]; then
        print_message $YELLOW "No production build found. Building..."
        build_prod
    fi
    
    print_message $GREEN "Starting Next.js production server..."
    print_message $BLUE "Frontend running at: http://localhost:3000"
    print_message $YELLOW "Press Ctrl+C to stop"
    echo ""
    npm run start
}

# Show status
show_status() {
    print_header "Frontend Status"
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_message $GREEN "✓ Frontend is running at http://localhost:3000"
    else
        print_message $RED "✗ Frontend is not running"
    fi
}

# Lint code
lint() {
    print_header "Linting Code"
    npm run lint
}

# Show help
show_help() {
    echo "COSC Casino Frontend Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install    Install npm dependencies"
    echo "  dev        Start development server (port 3000)"
    echo "  build      Build for production"
    echo "  prod       Start production server"
    echo "  lint       Run ESLint"
    echo "  status     Check if frontend is running"
    echo "  help       Show this help message"
    echo ""
    echo "Quick Start:"
    echo "  ./deploy.sh install   # First time setup"
    echo "  ./deploy.sh dev       # Start dev server"
    echo ""
    echo "Production:"
    echo "  ./deploy.sh build     # Build app"
    echo "  ./deploy.sh prod      # Start production server"
    echo ""
    echo "URL: http://localhost:3000"
}

# Main
case "${1:-help}" in
    install)
        check_node
        install_deps
        setup_env
        print_message $GREEN "✓ Installation complete!"
        print_message $YELLOW "Next: ./deploy.sh dev"
        ;;
    dev)
        start_dev
        ;;
    build)
        build_prod
        ;;
    prod)
        start_prod
        ;;
    lint)
        lint
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
