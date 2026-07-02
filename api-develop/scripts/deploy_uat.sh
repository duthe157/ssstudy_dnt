#!/usr/bin/env bash
set -euo pipefail

# Tham số cấu hình có thể override bằng biến môi trường
BRANCH="${BRANCH:-uat}"          # có thể đặt develop nếu bạn dùng develop cho UAT
REMOTE="${REMOTE:-origin}"

# Đi tới thư mục gốc repo (file này nằm trong ./scripts)
cd "$(dirname "$0")/.."

echo "[deploy-uat] Đang cập nhật mã nguồn từ nhánh $BRANCH..."
git fetch "$REMOTE"
git checkout "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

echo "[deploy-uat] Cài đặt dependencies..."
if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci || npm i
  else
    npm i
  fi
else
  echo "Lỗi: npm chưa có trong PATH." >&2
  exit 1
fi

echo "[deploy-uat] Khởi động lại PM2 (env=uat)..."
if command -v pm2 >/dev/null 2>&1; then
  sudo pm2 flush || pm2 flush
  sudo pm2 restart ecosystem.config.js --env uat || pm2 restart ecosystem.config.js --env uat
  # Hiển thị logs để theo dõi nhanh
  sudo pm2 logs || pm2 logs
else
  echo "Lỗi: pm2 chưa có trong PATH." >&2
  exit 1
fi

echo "[deploy-uat] Hoàn tất."


