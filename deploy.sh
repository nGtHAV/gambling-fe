#!/bin/bash#!/bin/bash



# COSC Casino Frontend Deployment Script# COSC Casino Frontend Deployment Script

# Deploys Next.js frontend locally (non-Docker)# Deploys Next.js frontend application using Docker



set -eset -e



# Colors# Colors

RED='\033[0;31m'RED='\033[0;31m'

GREEN='\033[0;32m'GREEN='\033[0;32m'

YELLOW='\033[1;33m'YELLOW='\033[1;33m'

BLUE='\033[0;34m'BLUE='\033[0;34m'

NC='\033[0m'NC='\033[0m'



print_message() {print_message() {

    echo -e "${1}${2}${NC}"    echo -e "${1}${2}${NC}"

}}



print_header() {print_header() {

    echo ""    echo ""

    print_message $BLUE "=============================================="    print_message $BLUE "=============================================="

    print_message $BLUE "$1"    print_message $BLUE "$1"

    print_message $BLUE "=============================================="    print_message $BLUE "=============================================="

    echo ""    echo ""

}}



# Get script directory# Get script directory (gambling-fe/)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"# Root directory (final/)

ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check Node.jscd "$ROOT_DIR"

check_node() {

    print_header "Checking Node.js Installation"# Check Docker

    check_docker() {

    if ! command -v node &> /dev/null; then    print_header "Checking Docker Installation"

        print_message $RED "Node.js is not installed."    

        print_message $YELLOW "Install Node.js 18+ from: https://nodejs.org/"    if ! command -v docker &> /dev/null; then

        exit 1        print_message $RED "Docker is not installed. Please install Docker first."

    fi        exit 1

        fi

    NODE_VERSION=$(node --version)    print_message $GREEN "✓ Docker is installed"

    print_message $GREEN "✓ Node.js $NODE_VERSION found"    

        if ! command -v docker compose &> /dev/null; then

    if ! command -v npm &> /dev/null; then        print_message $RED "Docker Compose is not installed."

        print_message $RED "npm is not installed."        exit 1

        exit 1    fi

    fi    print_message $GREEN "✓ Docker Compose is installed"

    print_message $GREEN "✓ npm found"    

}    if ! docker info &> /dev/null; then

        print_message $RED "Docker daemon is not running. Please start Docker."

# Install dependencies        exit 1

install_deps() {    fi

    print_header "Installing Dependencies"    print_message $GREEN "✓ Docker daemon is running"

    }

    npm install

    print_message $GREEN "✓ Dependencies installed"# Setup environment

}setup_env() {

    print_header "Setting Up Environment"

# Setup environment    

setup_env() {    if [ ! -f .env ]; then

    print_header "Setting Up Environment"        if [ -f .env.example ]; then

                print_message $YELLOW "Creating .env file from .env.example..."

    if [ ! -f ".env.local" ]; then            cp .env.example .env

        cat > .env.local << 'EOF'            print_message $GREEN "✓ .env file created"

# Backend API URL            print_message $YELLOW "⚠ Please review NEXT_PUBLIC_API_URL in .env"

NEXT_PUBLIC_API_URL=http://localhost:8000/api        else

            print_message $RED ".env.example not found. Please create .env manually."

# For production, change to your backend URL:            exit 1

# NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api        fi

EOF    else

        print_message $GREEN "✓ .env.local file created"        print_message $GREEN "✓ .env file exists"

        print_message $YELLOW "⚠ Edit .env.local if backend is on different URL"    fi

    else}

        print_message $GREEN "✓ .env.local file exists"

    fi# Build and deploy frontend

}deploy() {

    print_header "Deploying Frontend"

# Build for production    

build_prod() {    print_message $YELLOW "Building frontend container..."

    print_header "Building for Production"    docker compose build frontend

        print_message $GREEN "✓ Container built"

    npm run build    

    print_message $GREEN "✓ Production build complete"    print_message $YELLOW "Starting frontend..."

}    docker compose up -d frontend

    print_message $GREEN "✓ Frontend started"

# Start development server}

start_dev() {

    print_header "Starting Development Server"# Show status

    show_status() {

    print_message $GREEN "Starting Next.js development server..."    print_header "Frontend Status"

    print_message $BLUE "Frontend running at: http://localhost:3000"    

    print_message $YELLOW "Press Ctrl+C to stop"    docker compose ps frontend

    echo ""    

    npm run dev    echo ""

}    print_message $GREEN "=============================================="

    print_message $GREEN "  Frontend is running!"

# Start production server    print_message $GREEN "=============================================="

start_prod() {    echo ""

    print_header "Starting Production Server"    print_message $BLUE "Frontend: http://localhost:3000"

        echo ""

    if [ ! -d ".next" ]; then}

        print_message $YELLOW "No production build found. Building..."

        build_prod# Stop container

    fistop() {

        print_header "Stopping Frontend"

    print_message $GREEN "Starting Next.js production server..."    docker compose stop frontend

    print_message $BLUE "Frontend running at: http://localhost:3000"    print_message $GREEN "✓ Frontend stopped"

    print_message $YELLOW "Press Ctrl+C to stop"}

    echo ""

    npm run start# Rebuild

}rebuild() {

    print_header "Rebuilding Frontend"

# Show status    docker compose stop frontend

show_status() {    docker compose build --no-cache frontend

    print_header "Frontend Status"    docker compose up -d frontend

        print_message $GREEN "✓ Frontend rebuilt"

    if curl -s http://localhost:3000 > /dev/null 2>&1; then    show_status

        print_message $GREEN "✓ Frontend is running at http://localhost:3000"}

    else

        print_message $RED "✗ Frontend is not running"# View logs

    filogs() {

}    print_header "Viewing Frontend Logs"

    docker compose logs -f frontend

# Lint code}

lint() {

    print_header "Linting Code"# Show help

    npm run lintshow_help() {

}    echo "COSC Casino Frontend Deployment Script"

    echo ""

# Show help    echo "Usage: ./deploy.sh [command]"

show_help() {    echo ""

    echo "COSC Casino Frontend Deployment Script (Local)"    echo "Commands:"

    echo ""    echo "  deploy      Deploy frontend"

    echo "Usage: ./deploy.sh [command]"    echo "  start       Start container"

    echo ""    echo "  stop        Stop container"

    echo "Commands:"    echo "  restart     Restart container"

    echo "  install    Install npm dependencies"    echo "  rebuild     Rebuild container"

    echo "  dev        Start development server (port 3000)"    echo "  logs        View logs"

    echo "  build      Build for production"    echo "  status      Show status"

    echo "  prod       Start production server"    echo "  help        Show this help"

    echo "  lint       Run ESLint"    echo ""

    echo "  status     Check if frontend is running"}

    echo "  help       Show this help message"

    echo ""# Main

    echo "Quick Start:"case "${1:-deploy}" in

    echo "  ./deploy.sh install   # First time setup"    deploy)

    echo "  ./deploy.sh dev       # Start dev server"        check_docker

    echo ""        setup_env

    echo "Production:"        deploy

    echo "  ./deploy.sh build     # Build app"        show_status

    echo "  ./deploy.sh prod      # Start production server"        ;;

    echo ""    start)

    echo "URL: http://localhost:3000"        docker compose up -d frontend

}        show_status

        ;;

# Main    stop)

case "${1:-help}" in        stop

    install)        ;;

        check_node    restart)

        install_deps        docker compose restart frontend

        setup_env        show_status

        print_message $GREEN "✓ Installation complete!"        ;;

        print_message $YELLOW "Next: ./deploy.sh dev"    rebuild)

        ;;        check_docker

    dev)        rebuild

        start_dev        ;;

        ;;    logs)

    build)        logs

        build_prod        ;;

        ;;    status)

    prod)        show_status

        start_prod        ;;

        ;;    help|--help|-h)

    lint)        show_help

        lint        ;;

        ;;    *)

    status)        print_message $RED "Unknown command: $1"

        show_status        show_help

        ;;        exit 1

    help|--help|-h)        ;;

        show_helpesac

        ;;
    *)
        print_message $RED "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
