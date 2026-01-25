#!/bin/bash
# ADK Agents Manager
# Uso: ./start-all.sh [start|stop|status|task]

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="/tmp/adk-agents.pids"

# Carregar .env
if [ -f "$AGENTS_DIR/.env" ]; then
    export $(grep -v '^#' "$AGENTS_DIR/.env" | xargs)
fi

start_agents() {
    stop_agents 2>/dev/null
    echo "Iniciando agentes..."
    cd "$AGENTS_DIR/gemini_cli_agent" && python server.py &
    echo $! >> "$PIDS_FILE"
    cd "$AGENTS_DIR/tauri_frontend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"
    cd "$AGENTS_DIR/tauri_backend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"
    cd "$AGENTS_DIR/frontend_agent" && python server.py &
    echo $! >> "$PIDS_FILE"
    sleep 2
    status_agents
}

stop_agents() {
    [ -f "$PIDS_FILE" ] && while read pid; do kill $pid 2>/dev/null; done < "$PIDS_FILE" && rm "$PIDS_FILE"
    pkill -f "python server.py" 2>/dev/null
}

status_agents() {
    for p in 8002 8003 8004 8005; do
        curl -s "http://localhost:$p/health" >/dev/null 2>&1 && echo "$p:UP" || echo "$p:DOWN"
    done
}

# Enviar tarefa para agente
# Uso: ./start-all.sh task <porta> "<tarefa>" [arquivo1 arquivo2 ...]
task() {
    local port=$1
    local prompt=$2
    shift 2
    local files="$@"

    local json="{\"task\":\"$prompt\""
    [ -n "$files" ] && json+=",\"files\":[$(echo $files | sed 's/ /","/g;s/^/"/;s/$/"/')]"
    json+="}"

    curl -s -X POST "http://localhost:$port/invoke" \
        -H "Content-Type: application/json" \
        -d "$json" | python3 -c "import sys,json;r=json.load(sys.stdin);print(r.get('output','') or r.get('error',''))"
}

# Atalhos para cada agente
gemini() { task 8002 "$@"; }
tauri_front() { task 8003 "$@"; }
tauri_back() { task 8004 "$@"; }
frontend() { task 8005 "$@"; }

case "${1:-}" in
    start) start_agents ;;
    stop) stop_agents; echo "Parado" ;;
    status) status_agents ;;
    task) shift; task "$@" ;;
    gemini) shift; gemini "$@" ;;
    front|frontend) shift; frontend "$@" ;;
    tauri-front) shift; tauri_front "$@" ;;
    tauri-back) shift; tauri_back "$@" ;;
    *) echo "Uso: $0 [start|stop|status|task <porta> <prompt>|gemini|frontend|tauri-front|tauri-back]" ;;
esac
