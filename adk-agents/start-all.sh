#!/bin/bash
# ADK Agents Manager v2
# Uso: ./start-all.sh [start|stop|status|task|spawn]

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="/tmp/adk-agents.pids"
LOG_DIR="/tmp/adk-logs"
mkdir -p "$LOG_DIR"

# Cores
G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m'

# Carregar .env
[ -f "$AGENTS_DIR/.env" ] && export $(grep -v '^#' "$AGENTS_DIR/.env" | xargs)

start_agents() {
    stop_agents 2>/dev/null
    echo -e "${B}Iniciando agentes ADK...${N}"

    cd "$AGENTS_DIR/gemini_cli_agent" && python server.py > "$LOG_DIR/8002.log" 2>&1 &
    echo "$! 8002 gemini-cli" >> "$PIDS_FILE"

    cd "$AGENTS_DIR/tauri_frontend_agent" && python server.py > "$LOG_DIR/8003.log" 2>&1 &
    echo "$! 8003 tauri-front" >> "$PIDS_FILE"

    cd "$AGENTS_DIR/tauri_backend_agent" && python server.py > "$LOG_DIR/8004.log" 2>&1 &
    echo "$! 8004 tauri-back" >> "$PIDS_FILE"

    cd "$AGENTS_DIR/frontend_agent" && python server.py > "$LOG_DIR/8005.log" 2>&1 &
    echo "$! 8005 frontend" >> "$PIDS_FILE"

    sleep 2
    status_agents
}

stop_agents() {
    pkill -f "adk-agents.*server.py" 2>/dev/null
    [ -f "$PIDS_FILE" ] && rm "$PIDS_FILE"
    echo -e "${Y}Agentes parados${N}"
}

status_agents() {
    echo -e "\n${B}=== ADK Agents Status ===${N}"
    printf "%-6s %-15s %-8s %-20s\n" "PORTA" "AGENTE" "STATUS" "MODELO"
    echo "------------------------------------------------"

    for port in 8002 8003 8004 8005; do
        local resp=$(curl -s "http://localhost:$port/health" 2>/dev/null)
        if [ -n "$resp" ]; then
            local agent=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('agent','?'))" 2>/dev/null)
            local model=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('model','cli'))" 2>/dev/null)
            printf "%-6s %-15s ${G}%-8s${N} %-20s\n" "$port" "$agent" "UP" "$model"
        else
            printf "%-6s %-15s ${R}%-8s${N} %-20s\n" "$port" "-" "DOWN" "-"
        fi
    done

    # Mostrar instancias extras
    local extras=$(grep -E "^[0-9]+ 80[0-9]{2}" "$PIDS_FILE" 2>/dev/null | awk '$2 > 8005 {print $2}' | sort -u)
    if [ -n "$extras" ]; then
        echo -e "\n${Y}Instancias extras:${N}"
        for p in $extras; do
            curl -s "http://localhost:$p/health" >/dev/null 2>&1 && echo -e "  $p: ${G}UP${N}" || echo -e "  $p: ${R}DOWN${N}"
        done
    fi
    echo ""
}

# Spawn: inicia instancia extra numa porta livre
# Uso: ./start-all.sh spawn frontend 8010
spawn() {
    local agent=$1
    local port=${2:-$(shuf -i 8100-8199 -n 1)}
    local agent_dir=""

    case "$agent" in
        gemini|gemini-cli) agent_dir="gemini_cli_agent"; export GEMINI_CLI_PORT=$port ;;
        tauri-front*) agent_dir="tauri_frontend_agent"; export TAURI_FRONTEND_PORT=$port ;;
        tauri-back*) agent_dir="tauri_backend_agent"; export TAURI_BACKEND_PORT=$port ;;
        front*) agent_dir="frontend_agent"; export FRONTEND_AGENT_PORT=$port ;;
        *) echo "Agente desconhecido: $agent"; return 1 ;;
    esac

    echo -e "${B}Spawning $agent na porta $port...${N}"
    cd "$AGENTS_DIR/$agent_dir" && python server.py > "$LOG_DIR/$port.log" 2>&1 &
    echo "$! $port $agent" >> "$PIDS_FILE"
    sleep 1

    curl -s "http://localhost:$port/health" >/dev/null 2>&1 && \
        echo -e "${G}OK${N}: $agent rodando em localhost:$port" || \
        echo -e "${R}ERRO${N}: Falha ao iniciar. Ver $LOG_DIR/$port.log"
}

# Enviar tarefa
task() {
    local port=$1; local prompt=$2; shift 2; local files="$@"
    local json="{\"task\":\"$prompt\""
    [ -n "$files" ] && json+=",\"files\":[$(echo $files | sed 's/ /","/g;s/^/"/;s/$/"/')]"
    json+="}"

    echo -e "${B}Enviando para localhost:$port...${N}"
    curl -s -X POST "http://localhost:$port/invoke" \
        -H "Content-Type: application/json" \
        -d "$json" | python3 -c "import sys,json;r=json.load(sys.stdin);print(r.get('output','') or r.get('error',''))"
}

# Ver logs
logs() {
    local port=${1:-8005}
    tail -f "$LOG_DIR/$port.log"
}

# Atalhos
gemini() { task 8002 "$@"; }
tauri_front() { task 8003 "$@"; }
tauri_back() { task 8004 "$@"; }
frontend() { task 8005 "$@"; }

case "${1:-}" in
    start) start_agents ;;
    stop) stop_agents ;;
    status|st) status_agents ;;
    task) shift; task "$@" ;;
    spawn) shift; spawn "$@" ;;
    logs) shift; logs "$@" ;;
    gemini) shift; gemini "$@" ;;
    front*) shift; frontend "$@" ;;
    tauri-front) shift; tauri_front "$@" ;;
    tauri-back) shift; tauri_back "$@" ;;
    *)
        echo "ADK Agents Manager"
        echo ""
        echo "Uso: $0 <comando>"
        echo ""
        echo "Comandos:"
        echo "  start              Inicia todos os agentes"
        echo "  stop               Para todos os agentes"
        echo "  status             Mostra status dos agentes"
        echo "  spawn <agent> [porta]  Inicia instancia extra"
        echo "  task <porta> <prompt>  Envia tarefa para agente"
        echo "  logs [porta]       Ver logs de um agente"
        echo "  frontend <prompt>  Atalho para porta 8005"
        echo ""
        echo "Exemplos:"
        echo "  $0 start"
        echo "  $0 spawn frontend 8010"
        echo "  $0 task 8010 'Crie um botao'"
        echo "  $0 frontend 'Liste arquivos tsx'"
        ;;
esac
