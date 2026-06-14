#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║   Stitch Smart Finance Tracker       ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Check prerequisites ───────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker không tìm thấy. Cài Docker tại https://docs.docker.com/get-docker/${NC}"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo -e "${RED}❌ Docker Compose v2 không tìm thấy. Cập nhật Docker lên phiên bản mới nhất.${NC}"
  exit 1
fi

# ── Stop old containers if running ───────────────────────────────
echo -e "${YELLOW}🛑 Dừng containers cũ (nếu có)...${NC}"
docker compose down --remove-orphans 2>/dev/null || true

# ── Build & start ─────────────────────────────────────────────────
echo -e "${YELLOW}🔨 Build & khởi động toàn bộ services...${NC}"
docker compose up --build -d

# ── Wait for backend to be ready ─────────────────────────────────
echo -e "${YELLOW}⏳ Chờ backend sẵn sàng...${NC}"
MAX_WAIT=90
ELAPSED=0
until curl -sf http://localhost:5000/api/categories > /dev/null 2>&1; do
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${RED}❌ Backend không khởi động được sau ${MAX_WAIT}s. Xem log: docker compose logs backend${NC}"
    exit 1
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  echo "   ...${ELAPSED}s"
done

echo ""
echo -e "${GREEN}✅ Tất cả services đã sẵn sàng!${NC}"
echo ""
echo -e "  🌐 Frontend  →  ${GREEN}http://localhost:5175${NC}"
echo -e "  🔧 Backend   →  ${GREEN}http://localhost:5000/api${NC}"
echo ""
echo -e "  ${YELLOW}Để xem logs:${NC}   docker compose logs -f"
echo -e "  ${YELLOW}Để dừng:${NC}       docker compose down"
echo ""
