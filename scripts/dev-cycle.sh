#!/bin/bash
# dev-cycle.sh - Ciclo automatizado de desenvolvimento HotCocoa
# Uso: ./scripts/dev-cycle.sh [test|commit|pr|merge|full]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretorio do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# FASE: TEST
# =============================================================================
phase_test() {
    log_info "=== FASE: TESTES ==="

    # Frontend
    log_info "Testando frontend (bun build)..."
    if bun run build > /dev/null 2>&1; then
        log_ok "Frontend build OK"
    else
        log_error "Frontend build FALHOU"
        bun run build
        exit 1
    fi

    # Rust (se houver mudancas)
    if git diff --name-only HEAD~1 2>/dev/null | grep -q "src-tauri/"; then
        log_info "Verificando Rust..."

        if cargo check --manifest-path src-tauri/Cargo.toml 2>/dev/null; then
            log_ok "cargo check OK"
        else
            log_error "cargo check FALHOU"
            exit 1
        fi

        if cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings 2>/dev/null; then
            log_ok "cargo clippy OK"
        else
            log_warn "cargo clippy tem warnings"
        fi
    else
        log_info "Rust: sem mudancas, pulando"
    fi

    # Python (se houver mudancas)
    if git diff --name-only HEAD~1 2>/dev/null | grep -q "backend/"; then
        log_info "Verificando Python..."

        if [ -f ".venv/bin/activate" ]; then
            source .venv/bin/activate

            if command -v ruff &> /dev/null; then
                if ruff check backend/ 2>/dev/null; then
                    log_ok "ruff check OK"
                else
                    log_warn "ruff check tem issues"
                fi
            fi

            deactivate 2>/dev/null || true
        else
            log_warn "venv nao encontrado, pulando Python"
        fi
    else
        log_info "Python: sem mudancas, pulando"
    fi

    log_ok "Testes concluidos"
}

# =============================================================================
# FASE: COMMIT
# =============================================================================
phase_commit() {
    log_info "=== FASE: COMMIT ==="

    # Verificar se ha mudancas
    if git diff --quiet && git diff --cached --quiet; then
        log_warn "Nenhuma mudanca para commitar"
        return 0
    fi

    # Mostrar status
    log_info "Arquivos modificados:"
    git status --short | grep -v ".venv" | grep -v "__pycache__" | grep -v "node_modules"

    echo ""
    read -p "Tipo de commit (feat/fix/refactor/chore/docs): " COMMIT_TYPE
    read -p "Escopo (ex: desktop, backend, frontend): " COMMIT_SCOPE
    read -p "Descricao curta: " COMMIT_DESC

    # Adicionar arquivos (exceto ignorados)
    git add -A
    git reset .venv/ __pycache__/ node_modules/ 2>/dev/null || true

    # Criar commit
    git commit -m "${COMMIT_TYPE}(${COMMIT_SCOPE}): ${COMMIT_DESC}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

    log_ok "Commit criado"
}

# =============================================================================
# FASE: PR
# =============================================================================
phase_pr() {
    log_info "=== FASE: PUSH + PR ==="

    BRANCH=$(git branch --show-current)

    if [ "$BRANCH" = "main" ]; then
        log_error "Voce esta na branch main! Crie uma feature branch primeiro."
        exit 1
    fi

    # Push
    log_info "Push para origin/${BRANCH}..."
    git push -u origin "$BRANCH"

    # Verificar se PR existe
    EXISTING_PR=$(gh pr list --head "$BRANCH" --state open --json number -q '.[0].number' 2>/dev/null || echo "")

    if [ -n "$EXISTING_PR" ]; then
        log_info "PR #${EXISTING_PR} ja existe"
        gh pr view "$EXISTING_PR" --web
    else
        log_info "Criando novo PR..."

        # Gerar corpo do PR
        COMMITS=$(git log main..HEAD --oneline)

        gh pr create --title "$(git log -1 --format='%s')" --body "## Commits

\`\`\`
${COMMITS}
\`\`\`

## Checklist

- [ ] Build frontend passa
- [ ] Testes passam
- [ ] Codigo revisado

---
Gerado com [Claude Code](https://claude.com/claude-code)"
    fi

    log_ok "PR criado/atualizado"
}

# =============================================================================
# FASE: MERGE
# =============================================================================
phase_merge() {
    log_info "=== FASE: MERGE ==="

    BRANCH=$(git branch --show-current)

    # Encontrar PR
    PR_NUMBER=$(gh pr list --head "$BRANCH" --state open --json number -q '.[0].number' 2>/dev/null || echo "")

    if [ -z "$PR_NUMBER" ]; then
        log_error "Nenhum PR aberto encontrado para branch ${BRANCH}"
        exit 1
    fi

    # Verificar mergeable
    log_info "Verificando PR #${PR_NUMBER}..."
    MERGEABLE=$(gh pr view "$PR_NUMBER" --json mergeable -q '.mergeable')

    if [ "$MERGEABLE" != "MERGEABLE" ]; then
        log_error "PR nao pode ser merged (status: ${MERGEABLE})"
        log_info "Resolva conflitos manualmente"
        exit 1
    fi

    # Confirmar
    read -p "Fazer merge do PR #${PR_NUMBER}? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        log_warn "Merge cancelado"
        return 0
    fi

    # Merge
    gh pr merge "$PR_NUMBER" --squash --delete-branch

    # Atualizar main local
    git checkout main
    git pull origin main

    log_ok "Merge concluido! Branch ${BRANCH} deletada."

    # Perguntar sobre nova branch
    read -p "Criar nova branch? (nome ou Enter para pular): " NEW_BRANCH
    if [ -n "$NEW_BRANCH" ]; then
        git checkout -b "$NEW_BRANCH"
        log_ok "Branch ${NEW_BRANCH} criada"
    fi
}

# =============================================================================
# MAIN
# =============================================================================
case "${1:-full}" in
    test)
        phase_test
        ;;
    commit)
        phase_commit
        ;;
    pr)
        phase_pr
        ;;
    merge)
        phase_merge
        ;;
    full)
        phase_test
        phase_commit
        phase_pr
        log_info "Aguardando aprovacao do PR para merge..."
        log_info "Execute './scripts/dev-cycle.sh merge' apos aprovacao"
        ;;
    *)
        echo "Uso: $0 [test|commit|pr|merge|full]"
        echo ""
        echo "Fases:"
        echo "  test   - Roda testes (bun build, cargo check, ruff)"
        echo "  commit - Cria commit interativo"
        echo "  pr     - Push e cria/atualiza PR"
        echo "  merge  - Faz merge do PR e limpa branch"
        echo "  full   - Executa test -> commit -> pr"
        exit 1
        ;;
esac
