# Modal Commands

```bash
cd backend
source .venv/bin/activate

# Deploy
modal deploy backend.py

# Ver containers ativos
modal container list

# Ver logs de um container
modal container logs <container-id>

# Ver logs do app (streaming)
modal app logs picture-composer-backend-a100

# Parar todos os containers
modal app stop picture-composer-backend-a100

# Testar endpoint
curl -X POST "https://pedrogiudice--picture-composer-backend-a100-chat-with-ga-a943d1.modal.run" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Oi"}]}'
```

# Build AppImage (workaround)

O linuxdeploy bundled no Tauri nao suporta ELF moderno (.relr.dyn). Usar appimagetool:

```bash
# Primeiro, buildar para criar o AppDir
cargo tauri build --target x86_64-unknown-linux-gnu -b appimage

# O build vai falhar mas o AppDir sera criado
cd src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage

# Copiar icone para root
cp HotCocoa.AppDir/HotCocoa.png HotCocoa.AppDir/hotcocoa.png

# Criar AppImage manualmente
ARCH=x86_64 appimagetool HotCocoa.AppDir HotCocoa_0.1.0_amd64.AppImage
```
