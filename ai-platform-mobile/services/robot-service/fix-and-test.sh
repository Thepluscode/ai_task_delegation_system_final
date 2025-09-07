#!/bin/bash

# Robot Service Fix and Test Script
# This script applies fixes and tests the robot service in multiple configurations

# Color codes for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Robot Service Fix and Test Script${NC}"
echo -e "${BLUE}=======================================${NC}\n"

# Function to check if a command succeeded
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
    if [ "$1" = "critical" ]; then
      echo -e "${RED}Critical step failed. Stopping execution.${NC}"
      exit 1
    fi
  fi
}

# Step 1: Clean up existing artifacts
echo -e "${CYAN}Step 1: Cleaning up existing artifacts...${NC}"
rm -rf node_modules dist package-lock.json
check_success

# Step 2: Make sure environment file exists
echo -e "\n${CYAN}Step 2: Checking environment configuration...${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating default .env file...${NC}"
  cat > .env << EOL
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=robot_service
DB_SYNCHRONIZE=true
DB_SSL=false

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_SASL_ENABLED=false
KAFKA_SASL_USERNAME=
KAFKA_SASL_PASSWORD=
KAFKA_SSL=false

# API Configuration
PORT=3001
CORS_ORIGINS=*
LOG_LEVEL=debug
NODE_ENV=development
EOL
  echo -e "${GREEN}✓ Default .env file created${NC}"
else
  echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 3: Install dependencies
echo -e "\n${CYAN}Step 3: Installing dependencies...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
npm install --legacy-peer-deps
check_success "critical"

# Step 4: Install additional dependencies that might be missing
echo -e "\n${CYAN}Step 4: Installing additional dependencies...${NC}"
npm install --save-dev tsconfig-paths dotenv pg --legacy-peer-deps
check_success

# Step 5: Build the project
echo -e "\n${CYAN}Step 5: Building the project...${NC}"
npm run build
check_success

# Step 6: Test database connection
echo -e "\n${CYAN}Step 6: Testing database connection...${NC}"
echo -e "${YELLOW}This test will verify if PostgreSQL is properly configured.${NC}"
read -p "Do you want to test the database connection? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  node test-db-connection.js
  check_success
else
  echo -e "${YELLOW}Skipping database connection test${NC}"
fi

# Step 7: Offer different ways to start the service
echo -e "\n${CYAN}Step 7: Starting options${NC}"
echo -e "${YELLOW}Choose one of the following options to start the service:${NC}"
echo -e "  ${BLUE}1)${NC} Run with debug logging (recommended for troubleshooting)"
echo -e "  ${BLUE}2)${NC} Run with simplified module (minimal dependencies)"
echo -e "  ${BLUE}3)${NC} Run normal service (standard configuration)"
echo -e "  ${BLUE}4)${NC} Exit without running"

read -p "Enter option (1-4): " -n 1 -r
echo
case $REPLY in
  1)
    echo -e "\n${CYAN}Starting service with debug logging...${NC}"
    npx ts-node -r tsconfig-paths/register src/debug-bootstrap.ts
    ;;
  2)
    echo -e "\n${CYAN}Starting service with simplified module...${NC}"
    NODE_ENV=development npx ts-node -r tsconfig-paths/register src/main.ts --require=src/simplified-app.module.ts
    ;;
  3)
    echo -e "\n${CYAN}Starting service normally...${NC}"
    npm run start:dev
    ;;
  *)
    echo -e "\n${YELLOW}Exiting without starting the service${NC}"
    ;;
esac

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}Script completed${NC}"
echo -e "${BLUE}=======================================${NC}"