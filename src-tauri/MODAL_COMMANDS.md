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
