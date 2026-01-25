---
name: hotcocoa-deploy
description: Build e deploy do HotCocoa para desktop Linux. Use quando o usuario disser "/deploy", "build e deploy", "atualiza o app", "manda pra maquina local".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# HotCocoa Deploy - Build .deb e Deploy via Tailscale

Build e deploy automatizado do app HotCocoa para desktop Linux.

## Quando Usar

- `/deploy` - Build completo + deploy
- `/deploy --build-only` - Apenas build, sem deploy
- `/deploy --install` - Apenas instalar (assume .deb ja existe)

## Infraestrutura

| Item | Valor |
|------|-------|
| **Target** | `cmr-auto@100.102.249.9` |
| **Destino** | `~/Desktop/` |
| **Rede** | Tailscale |
| **Chave Privada** | `~/.tauri/keys/hotcocoa.key` |

## Workflow Completo

### 1. Build Frontend

```bash
npm run build
```

### 2. Build .deb com Assinatura

```bash
# Exportar chave de assinatura
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/keys/hotcocoa.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""

# Build .deb
cargo tauri build --bundles deb
```

**Output:** `src-tauri/target/release/bundle/deb/HotCocoa_X.X.X_amd64.deb`

### 3. Criar Tarball e Assinar (para auto-update)

```bash
cd src-tauri/target/release/bundle/deb

# Criar tarball
tar -czvf HotCocoa_X.X.X_amd64.deb.tar.gz HotCocoa_X.X.X_amd64.deb

# Assinar com minisign
minisign -Sm HotCocoa_X.X.X_amd64.deb.tar.gz -s ~/.tauri/keys/hotcocoa.key
```

### 4. Deploy via Tailscale

```bash
scp src-tauri/target/release/bundle/deb/HotCocoa_*.deb cmr-auto@100.102.249.9:~/Desktop/
```

### 5. Instalar Remotamente

```bash
ssh cmr-auto@100.102.249.9 "sudo dpkg -i ~/Desktop/HotCocoa_*.deb"
```

### 6. Verificar Instalacao

```bash
ssh cmr-auto@100.102.249.9 "which hotcocoa && hotcocoa --version"
```

## Atualizar latest.json (para auto-update)

Apos build, atualizar `latest.json` com:

1. Nova versao
2. Assinatura (conteudo do .minisig convertido para base64)
3. URL do GitHub Release

```json
{
  "version": "X.X.X",
  "notes": "Release notes aqui",
  "pub_date": "YYYY-MM-DDTHH:MM:SSZ",
  "platforms": {
    "linux-x86_64": {
      "signature": "<base64 do .minisig>",
      "url": "https://github.com/PedroGiudice/Picture-composer/releases/download/vX.X.X/HotCocoa_X.X.X_amd64.deb.tar.gz"
    }
  }
}
```

## Comandos Rapidos

```bash
# Build completo e deploy
npm run build && cargo tauri build --bundles deb && \
scp src-tauri/target/release/bundle/deb/HotCocoa_*.deb cmr-auto@100.102.249.9:~/Desktop/ && \
ssh cmr-auto@100.102.249.9 "sudo dpkg -i ~/Desktop/HotCocoa_*.deb"

# Apenas deploy (sem rebuild)
scp src-tauri/target/release/bundle/deb/HotCocoa_*.deb cmr-auto@100.102.249.9:~/Desktop/ && \
ssh cmr-auto@100.102.249.9 "sudo dpkg -i ~/Desktop/HotCocoa_*.deb"

# Testar app remotamente
ssh cmr-auto@100.102.249.9 "DISPLAY=:0 hotcocoa &"
```

## Checklist

```
[ ] npm run build OK
[ ] cargo tauri build --bundles deb OK
[ ] .deb gerado em target/release/bundle/deb/
[ ] scp para maquina local OK
[ ] dpkg -i instalou sem erros
[ ] App executa corretamente
```

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| Build falha no strip | Usar `--bundles deb` (nao AppImage) |
| Chave privada nao encontrada | `ls ~/.tauri/keys/hotcocoa.key` |
| Assinatura invalida | Regenerar com `minisign -G -W` |
| SSH timeout | Verificar Tailscale: `tailscale status` |
| dpkg falha deps | `sudo apt install -f` |

## NUNCA

- Commitar a chave privada (`~/.tauri/keys/hotcocoa.key`)
- Deploy sem testar build local
- Ignorar erros de assinatura
