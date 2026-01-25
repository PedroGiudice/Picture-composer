#!/bin/bash
# Deploy para maquina local via Tailscale
# Uso: ./deploy-local.sh

set -e

TARGET_USER="cmr-auto"
TARGET_IP="100.102.249.9"
TARGET_PATH="/home/cmr-auto/Desktop/hotcocoa"
PROJECT_DIR="/home/opc/Picture-composer"

echo "[1/4] Building frontend..."
cd "$PROJECT_DIR"
npm run build

echo "[2/4] Building Tauri (release)..."
cd "$PROJECT_DIR/src-tauri"
cargo build --release

echo "[3/4] Deploying to $TARGET_USER@$TARGET_IP..."
scp "$PROJECT_DIR/src-tauri/target/release/hotcocoa" "$TARGET_USER@$TARGET_IP:$TARGET_PATH"

echo "[4/4] Setting permissions..."
ssh "$TARGET_USER@$TARGET_IP" "chmod +x $TARGET_PATH"

echo ""
echo "====================================="
echo "Deploy completo!"
echo "Binario em: $TARGET_PATH"
echo "====================================="
