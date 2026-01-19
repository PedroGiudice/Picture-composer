# Quick Start - Ollama Chat no HotCocoa Flutter

Guia rapido de 5 minutos para comecar a usar o chat com Ollama.

## 1. Instalar Ollama (se nao tiver)

### Linux/macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download: https://ollama.ai

## 2. Baixar um Modelo

```bash
# Modelo leve e rapido (recomendado para comecar)
ollama pull llama2

# Alternativas:
# ollama pull mistral      # Mais inteligente
# ollama pull qwen2.5      # Melhor em portugues
# ollama pull phi          # Muito leve
```

## 3. Iniciar Servico Ollama

```bash
# Em um terminal, deixe rodando
ollama serve
```

Deve aparecer: `Listening on http://127.0.0.1:11434`

## 4. Rodar o App Flutter

```bash
cd hotcocoa_flutter
flutter run -d linux  # ou macos, windows
```

## 5. Usar o Chat

1. No app, navegue para "Chat"
2. Verifique o indicador verde: "Ollama Online"
3. Digite sua mensagem
4. Pressione Enter ou clique em Enviar
5. Observe a resposta chegando em tempo real

## Comandos Uteis do Ollama

```bash
# Listar modelos instalados
ollama list

# Remover modelo
ollama rm llama2

# Ver modelos disponiveis
ollama search

# Parar servico
pkill ollama

# Rodar modelo diretamente no terminal (teste)
ollama run llama2
```

## Configuracoes do Chat

Clique no icone de engrenagem para:
- Selecionar modelo
- Ajustar temperatura (criatividade)
- Ajustar tokens maximos (tamanho da resposta)

## Problemas Comuns

### "Ollama nao esta rodando"
```bash
# Verificar se esta rodando
ps aux | grep ollama

# Iniciar
ollama serve
```

### "Nenhum modelo encontrado"
```bash
# Baixar modelo
ollama pull llama2

# Verificar instalacao
ollama list
```

### App nao conecta
```bash
# Verificar porta
netstat -an | grep 11434

# Deve mostrar LISTEN na porta 11434
```

### Streaming nao funciona
1. Verificar versao do Ollama: `ollama --version`
2. Atualizar se necessario
3. Reiniciar servico

## Dicas

1. **Primeira Conversa Lenta:** O primeiro request pode demorar enquanto o modelo carrega

2. **Temperatura:**
   - Baixa (0.1-0.5): Respostas mais previsíveis/tecnicas
   - Media (0.6-0.9): Equilibrado
   - Alta (1.0-2.0): Mais criativo/variado

3. **Tokens Maximos:**
   - 256: Respostas curtas
   - 1024: Equilibrado
   - 4096: Respostas longas

4. **Contexto:**
   - O historico eh automaticamente incluido
   - Limpe para comecar conversa nova

5. **Performance:**
   - Modelos maiores = mais lentos mas melhores
   - Modelos menores = mais rapidos mas limitados

## Modelos Recomendados

### Para Comecar
- **llama2** (3.8GB): Equilibrado, bom para tudo

### Para Portugues
- **qwen2.5** (4.4GB): Excelente em portugues brasileiro

### Para Performance
- **phi** (1.6GB): Muito rapido, respostas curtas

### Para Qualidade
- **mistral** (4.1GB): Mais inteligente, melhor raciocinio

## Proximos Passos

1. Experimente diferentes modelos
2. Ajuste temperatura para seu caso de uso
3. Limpe historico quando trocar de assunto
4. Leia `OLLAMA_INTEGRATION.md` para detalhes tecnicos
5. Veja `TESTE_OLLAMA.md` para testes completos

## Recursos

- **Documentacao Ollama:** https://ollama.ai/docs
- **Modelos Disponiveis:** https://ollama.ai/library
- **Integracao Detalhada:** [OLLAMA_INTEGRATION.md](./OLLAMA_INTEGRATION.md)
- **Guia de Testes:** [TESTE_OLLAMA.md](./TESTE_OLLAMA.md)
- **Exemplos de Codigo:** [ollama_example.dart](./lib/shared/services/ollama_example.dart)

---

**Tempo estimado:** 5 minutos
**Dificuldade:** Facil
**Pre-requisitos:** Flutter SDK instalado

Divirta-se conversando com IA local no HotCocoa!
