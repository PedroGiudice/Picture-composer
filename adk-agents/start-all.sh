#!/bin/bash
# Inicia todos os agentes ADK em background
# Uso: ./start-all.sh [start|stop|status]

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="/tmp/adk-agents.pids"

start_agents() {
    echo "Iniciando agentes ADK..."

    # Matar processos anteriores se existirem
    stop_agents 2>/dev/null

    # Gemini CLI Agent (8002)
    cd "$AGENTS_DIR/gemini_cli_agent" && python server.py &
    echo $! >> "$PIDS_FILE"

    # Tauri Frontend Agent (8003)
    cd "$AGENTS_DIR/tauri_frontend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"

    # Tauri Backend Agent (8004)
    cd "$AGENTS_DIR/tauri_backend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"

    # Frontend Agent (8005)
    cd "$AGENTS_DIR/frontend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"

    sleep 2
    echo "Agentes iniciados. Health check:"
    curl -s http://localhost:8002/health | head -c 50 && echo " (8002)"
    curl -s http://localhost:8003/health | head -c 50 && echo " (8003)"
    curl -s http://localhost:8004/health | head -c 50 && echo " (8004)"
    curl -s http://localhost:8005/health | head -c 50 && echo " (8005)"
}

stop_agents() {
    echo "Parando agentes..."
    if [ -f "$PIDS_FILE" ]; then
        while read pid; do
            kill $pid 2>/dev/null
        done < "$PIDS_FILE"
        rm "$PIDS_FILE"
    fi
    pkill -f "python server.py" 2>/dev/null
    echo "Agentes parados."
}

status_agents() {
    echo "Status dos agentes:"
    for port in 8002 8003 8004 8005; do
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            echo "  $port: UP"
        else
            echo "  $port: DOWN"
        fi
    done
}

case "${1:-start}" in
    start) start_agents ;;
    stop) stop_agents ;;
    status) status_agents ;;
    *) echo "Uso: $0 [start|stop|status]" ;;
esac
