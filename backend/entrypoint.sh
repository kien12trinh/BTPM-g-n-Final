#!/bin/sh
set -e

echo "⏳ Waiting for MySQL to be ready..."

# Poll until MySQL accepts connections
until python -c "
import pymysql, os, sys
url = os.getenv('DATABASE_URL', '')
# parse host from mysql+pymysql://user:pass@host/db
host = url.split('@')[1].split('/')[0]
try:
    pymysql.connect(host=host, user='root', password='root', connect_timeout=3)
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
  echo "  MySQL not ready — retrying in 3s..."
  sleep 3
done

echo "✅ MySQL is ready"

echo "🔄 Running database migrations..."
# Init migration repo nếu chưa có (lần đầu)
if [ ! -d "migrations" ]; then
  flask db init
  flask db migrate -m "initial"
fi
flask db upgrade

echo "🚀 Starting Flask server..."
exec python run.py
