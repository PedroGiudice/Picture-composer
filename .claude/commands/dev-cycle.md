# /dev-cycle - Ciclo Completo de Desenvolvimento

Skill para padronizar e automatizar o workflow de desenvolvimento do HotCocoa.

**Uso:** `/dev-cycle [fase]`

Fases: `test`, `commit`, `pr`, `merge`, `full`

---

## Referencia Rapida de Comandos

### Rust/Cargo (Backend Tauri)

```bash
# Verificar sintaxe sem compilar
cargo check --manifest-path src-tauri/Cargo.toml

# Compilar em modo debug
cargo build --manifest-path src-tauri/Cargo.toml

# Compilar em modo release
cargo build --release --manifest-path src-tauri/Cargo.toml

# Rodar testes Rust
cargo test --manifest-path src-tauri/Cargo.toml

# Verificar formatacao
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check

# Aplicar formatacao
cargo fmt --manifest-path src-tauri/Cargo.toml

# Lint com clippy
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

### Tauri CLI

```bash
# Desenvolvimento (hot reload)
./node_modules/.bin/tauri dev

# Build de producao
./node_modules/.bin/tauri build

# Build apenas .deb
./node_modules/.bin/tauri build --bundles deb

# Build apenas AppImage (requer FUSE)
./node_modules/.bin/tauri build --bundles appimage

# Gerar icones a partir de um PNG
./node_modules/.bin/tauri icon src-tauri/app-icon.png
```

### Frontend (Bun/Vite)

```bash
# Instalar dependencias
bun install

# Desenvolvimento
bun run dev

# Build producao
bun run build

# Preview do build
bun run preview

# Type check
bun run typecheck  # se configurado
```

### Backend Python (Modal)

```bash
# Ativar venv
source .venv/bin/activate

# Lint
ruff check backend/

# Type check
mypy backend/

# Testes
pytest backend/tests/

# Deploy para Modal
modal deploy backend/backend.py
```

---

## Workflow Padrao

### Fase 1: TESTAR (`/dev-cycle test`)

```bash
# 1. Frontend
bun run build

# 2. Rust (se houver mudancas em src-tauri/)
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check

# 3. Python (se houver mudancas em backend/)
source .venv/bin/activate
ruff check backend/
mypy backend/ --ignore-missing-imports
```

### Fase 2: COMMIT (`/dev-cycle commit`)

```bash
# 1. Verificar status
git status --short | grep -v ".venv"

# 2. Adicionar arquivos relevantes (NUNCA .venv, __pycache__, node_modules)
git add <arquivos>

# 3. Commit com conventional commits
git commit -m "tipo(escopo): descricao

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Tipos de commit:**
- `feat` - Nova funcionalidade
- `fix` - Correcao de bug
- `refactor` - Refatoracao sem mudanca de comportamento
- `docs` - Documentacao
- `chore` - Tarefas de manutencao
- `test` - Adicao/correcao de testes

### Fase 3: PUSH + PR (`/dev-cycle pr`)

```bash
# 1. Push da branch
git push -u origin <branch-name>

# 2. Verificar se ja existe PR
gh pr list --head <branch-name> --state all

# 3. Criar PR (se nao existir)
gh pr create --title "tipo(escopo): descricao" --body "..."

# 4. Se PR ja existe, apenas informar URL
gh pr view <branch-name> --web
```

### Fase 4: MERGE (`/dev-cycle merge`)

```bash
# 1. Verificar status do PR
gh pr checks <pr-number>

# 2. Verificar merge conflicts
gh pr view <pr-number> --json mergeable

# 3. Merge (squash para historico limpo)
gh pr merge <pr-number> --squash --delete-branch

# 4. Atualizar main local
git checkout main
git pull origin main

# 5. Criar nova branch para proximo trabalho (se necessario)
git checkout -b feat/nova-feature
```

---

## Ciclo Completo (`/dev-cycle full`)

Executa todas as fases em sequencia:

1. **Testar** - Valida frontend, Rust e Python
2. **Commit** - Cria commit com conventional commits
3. **Push + PR** - Envia para GitHub e cria/atualiza PR
4. **Aguardar** - Pausa para review humano
5. **Merge** - Apos aprovacao, faz merge e limpa branch

---

## Estrutura de Branches

```
main                    # Producao, sempre estavel
  |
  +-- feat/xxx          # Novas funcionalidades
  +-- fix/xxx           # Correcoes de bugs
  +-- refactor/xxx      # Refatoracoes
  +-- chore/xxx         # Manutencao
```

**Regras:**
- Nunca commit direto na `main`
- Sempre criar PR para merge
- Deletar branch apos merge
- Nome da branch: `tipo/descricao-curta`

---

## Artefatos de Build (HotCocoa)

| Tipo | Comando | Saida |
|------|---------|-------|
| Dev | `tauri dev` | Roda localmente |
| .deb | `tauri build --bundles deb` | `src-tauri/target/release/bundle/deb/` |
| AppImage | `tauri build --bundles appimage` | `src-tauri/target/release/bundle/appimage/` |
| Binario | `tauri build` | `src-tauri/target/release/hotcocoa` |

---

## Troubleshooting

### Rust

| Erro | Solucao |
|------|---------|
| `cargo not found` | `source ~/.cargo/env` |
| `failed to run cargo metadata` | Verificar PATH, rodar com PATH explicito |
| `missing dependencies` | `sudo apt install build-essential` |

### Tauri

| Erro | Solucao |
|------|---------|
| `libgtk not found` | `sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev` |
| `FUSE not available` | `sudo apt install libfuse2` |
| `port in use` | Matar processo ou mudar porta no tauri.conf.json |

### Git/GitHub

| Erro | Solucao |
|------|---------|
| `merge conflicts` | Resolver manualmente, `git add`, `git commit` |
| `branch behind` | `git pull origin main --rebase` |
| `gh auth` | `gh auth login` |

---

## Checklist Pre-PR

- [ ] `bun run build` passa sem erros
- [ ] `cargo check` passa (se mudou Rust)
- [ ] `cargo clippy` sem warnings (se mudou Rust)
- [ ] `ruff check` passa (se mudou Python)
- [ ] Commits seguem conventional commits
- [ ] Branch tem nome descritivo
- [ ] PR tem descricao clara

---

## Exemplo de Uso

```
Usuario: Acabei de fazer uma correcao no PhotoUploader

Claude: Vou executar o ciclo de desenvolvimento.

[Executa /dev-cycle full]

1. Testando frontend... OK
2. Verificando Rust... SKIP (sem mudancas)
3. Verificando Python... SKIP (sem mudancas)
4. Criando commit...
5. Push para origin/fix/photo-uploader...
6. Criando PR #4...

PR criado: https://github.com/.../pull/4

Aguardando aprovacao para merge.
```
