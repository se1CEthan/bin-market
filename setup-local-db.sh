#!/bin/bash

# Setup script for local PostgreSQL database

echo "🚀 BIN Marketplace - Local Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Arch Linux: sudo pacman -S postgresql"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Database configuration
DB_NAME="bin_marketplace"
DB_USER="bin_user"
DB_PASSWORD="bin_password_$(openssl rand -hex 8)"

echo "Creating database and user..."
echo ""

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database created successfully!"
    echo ""
    echo "📝 Add this to your .env file:"
    echo ""
    echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    echo ""
    echo "Next steps:"
    echo "1. Copy the DATABASE_URL above to your .env file"
    echo "2. Run: npm run db:push"
    echo "3. Run: npm run dev"
else
    echo ""
    echo "❌ Failed to create database"
    echo ""
    echo "Try running PostgreSQL commands manually:"
    echo "  sudo -u postgres psql"
    echo "  CREATE DATABASE $DB_NAME;"
    echo "  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
fi
