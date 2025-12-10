#!/bin/bash

# COSC Casino Frontend Deployment Script
# Deploys Next.js frontend locally

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
        print_message $YELLOW "Creating default .env.local file..."
        cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF
        print_message $GREEN "✓ Default .env.local file created"
    else
        print_message $GREEN "✓ .env.local file exists"
    fi
}

# Start development server
dev() {
    print_header "Starting Development Server"
    
    print_message $GREEN "Frontend running at: http://localhost:3000"
    npm run dev
}

# Build for production
build() {
    print_header "Building for Production"
    
    npm run build
    print_message $GREEN "✓ Production build complete"
}

# Start production server
prod() {
    print_header "Starting Production Server"
    
    print_message $GREEN "Frontend running at: http://localhost:3000"
    npm run start
}

# Run linter
lint() {
    print_header "Running Linter"
    
    npm run lint
}

# Show status
status() {
    print_header "Frontend Status"
    
    if lsof -i :3000 > /dev/null 2>&1; then
        print_message $GREEN "✓ Frontend is running on port 3000"
        lsof -i :3000
    else
        print_message $YELLOW "Frontend is not running"
    fi
}

# Show help
show_help() {
    echo "COSC Casino Frontend Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install  Install npm dependencies"
    echo "  dev      Start development server"
    echo "  build    Build for production"
    echo "  prod     Start production server"
    echo "  lint     Run ESLint"
    echo "  status   Check server status"
    echo "  help     Show this help message"
    echo ""
    echo "Quick Start:"
    echo "  ./deploy.sh install"
    echo "  ./deploy.sh dev"
}

# Main script
case "${1:-help}" in
    install)
        check_node
        install_deps
        setup_env
        print_message $GREEN "✓ Installation complete!"
        print_message $YELLOW "Next: ./deploy.sh dev"
        ;;
    dev)
        dev
        ;;
    build)
        build
        ;;
    prod)
        prod
        ;;
    lint)
        lint
        ;;
    status)
        status
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
